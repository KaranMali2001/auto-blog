"use node";
import crypto from "node:crypto";
import { v } from "convex/values";
import { shouldExcludeFile } from "@/utils/utils";
import { internal } from "../_generated/api";
import { type ActionCtx, internalAction } from "../_generated/server";
import { githubApp } from "../config/github";
import { singleCommitPrompt } from "../config/prompts";

const WEBHOOK_SECRET: string = process.env.GITHUB_WEBHOOK_SECRET!;

export const getCommitDiffAction = internalAction({
  args: {
    installationId: v.number(),
    github_url: v.string(),
    commitSha: v.string(),
    id: v.id("webhooks"),
  },
  handler: async (ctx: ActionCtx, args) => {
    try {
      const parts = args.github_url.split("/");
      const owner = parts[3];
      const repo = parts[4];
      if (!owner || !repo) {
        throw new Error(`Invalid github_url: ${args.github_url}`);
      }
      const { commit, filesChanged, stats, filteredDiff } = await ctx.runAction(internal.action_helpers.github.getCommitData, {
        installationId: args.installationId,
        commitSha: args.commitSha,
        owner,
        repo,
      });
      const user = await ctx.runQuery(internal.schema.user.getUserByinstallationId, {
        installationId: args.installationId,
      });
      const repos = await ctx.runQuery(internal.schema.repo.getRepoByInstallation, {
        installationId: args.installationId,
        repoUrl: [args.github_url],
      });
      if (!repos || repos.length === 0) {
        throw new Error("Repo not found");
      }
      const newCommit = await ctx.runMutation(internal.schema.commit.createCommit, {
        commitSha: args.commitSha,
        commitMessage: commit.commit.message,
        commitRepositoryUrl: args.github_url,
        commitAuthor: commit.commit.author?.name || "Unknown",
        repoId: repos[0]._id,
        userId: user._id,
      });

      await ctx.runMutation(internal.schema.webhook.updateStatus, {
        id: args.id,
        status: "success",
      });
      const repoContextData = await ctx.runAction(internal.action_helpers.github.getRepoContext, {
        installationId: args.installationId,
        owner,
        repo,
      });
      await ctx.runMutation(internal.schema.repo.updateRepoContext, {
        repoId: repos[0]._id,
        ...repoContextData,
      });
      const repoContextParts: string[] = [];
      if (repoContextData.repoDescription) repoContextParts.push(`Description: ${repoContextData.repoDescription}`);
      if (repoContextData.repoLanguage) repoContextParts.push(`Primary language: ${repoContextData.repoLanguage}`);
      if (repoContextData.readmePreview) repoContextParts.push(`README (excerpt):\n${repoContextData.readmePreview}`);
      if (repoContextData.fileTreePreview) repoContextParts.push(`File structure:\n${repoContextData.fileTreePreview}`);
      const repoContext = repoContextParts.length > 0 ? repoContextParts.join("\n\n") : "";
      const promptToUse = user.customCommitPrompt && user.customCommitPrompt.trim() !== "" ? user.customCommitPrompt : singleCommitPrompt;
      const commitSummary = await ctx.runAction(internal.action_helpers.gemini.getSummary, {
        commitMessage: commit.commit.message,
        filesChanged,
        stats,
        fileContent: filteredDiff,
        prompt: promptToUse,
        repoContext,
      });
      if (!commitSummary) {
        return null;
      }

      await ctx.runMutation(internal.schema.commit.updateCommit, {
        summarizedCommitDiff: commitSummary,
        commitId: newCommit._id,
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("Error in getCommitDiffAction:", errMsg, error);

      await ctx.runMutation(internal.schema.webhook.updateStatus, {
        id: args.id,
        status: "failed",
      });

      return null;
    }
  },
});

export const VerifyGithubWebhookAction = internalAction({
  args: { signature: v.string(), body: v.string() },
  handler: async (_ctx: ActionCtx, args): Promise<boolean> => {
    const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
    const digest: string = `sha256=${hmac.update(args.body).digest("hex")}`;

    if (!crypto.timingSafeEqual(Buffer.from(args.signature), Buffer.from(digest))) {
      return false;
    }
    return true;
  },
});
export const getInstallationRepo = internalAction({
  args: {
    installationId: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const github = githubApp();
    const octokit = await github.getInstallationOctokit(args.installationId);
    const repos = await octokit.request("GET /installation/repositories", {
      installation_id: args.installationId,
    });
    const dbRepos = await ctx.runQuery(internal.schema.repo.getRepoByInstallation, {
      installationId: args.installationId,
      repoUrl: repos.data.repositories.map((r) => r.html_url),
    });

    for (const repo of repos.data.repositories) {
      const exists = dbRepos?.find((r) => r.repoUrl === repo.html_url);

      if (exists) {
        console.log(`Repo already exists, skipping: ${repo.full_name}`);
        continue;
      }

      await ctx.runMutation(internal.schema.repo.createRepo, {
        name: repo.full_name,
        repoUrl: repo.html_url,
        installationId: args.installationId,
        userId: args.userId,
      });
    }
  },
});
const README_MAX_CHARS = 5000;
const FILE_TREE_MAX_PATHS = 150;

export const getRepoContext = internalAction({
  args: {
    installationId: v.number(),
    owner: v.string(),
    repo: v.string(),
  },
  handler: async (_ctx, args) => {
    const app = githubApp();
    const octokit = await app.getInstallationOctokit(args.installationId);
    let readmePreview: string | undefined;
    let repoDescription: string | undefined;
    let repoLanguage: string | undefined;
    let fileTreePreview: string | undefined;

    try {
      const { data: readme } = await octokit.rest.repos.getReadme({
        owner: args.owner,
        repo: args.repo,
      });
      if (readme.content) {
        const decoded = Buffer.from(readme.content, "base64").toString("utf-8");
        readmePreview = decoded.length > README_MAX_CHARS ? decoded.slice(0, README_MAX_CHARS) + "\n...[truncated]" : decoded;
      }
    } catch {
      // README may not exist
    }

    try {
      const { data: repoData } = await octokit.rest.repos.get({
        owner: args.owner,
        repo: args.repo,
      });
      repoDescription = repoData.description ?? undefined;
      repoLanguage = repoData.language ?? undefined;
    } catch {
      // Ignore
    }

    try {
      const { data: contents } = await octokit.rest.repos.getContent({
        owner: args.owner,
        repo: args.repo,
        path: "",
      });
      const paths: string[] = [];
      const collect = (items: typeof contents) => {
        if (Array.isArray(items)) {
          for (const item of items) {
            if (paths.length >= FILE_TREE_MAX_PATHS) break;
            paths.push(item.type === "dir" ? `${item.path}/` : item.path);
          }
        }
      };
      collect(contents);
      if (paths.length > 0) {
        fileTreePreview = paths.join("\n");
      }
    } catch {
      // Ignore
    }

    return { readmePreview, repoDescription, repoLanguage, fileTreePreview };
  },
});

export const getCommitData = internalAction({
  args: {
    installationId: v.number(),
    commitSha: v.string(),
    owner: v.string(),
    repo: v.string(),
  },
  handler: async (_ctx, args) => {
    const app = githubApp();
    const installationOctokit = await app.getInstallationOctokit(args.installationId);

    const { data: commit } = await installationOctokit.rest.repos.getCommit({
      owner: args.owner,
      repo: args.repo,
      ref: args.commitSha,
    });

    const files = commit.files ?? [];

    // Filter out excluded files
    const relevantFiles = files.filter((f) => {
      return Boolean(f.filename) && !shouldExcludeFile(f.filename, f);
    });

    // Extract patch parts, drop undefined ones
    const patches: string[] = [];
    for (const f of relevantFiles) {
      if (f.patch) {
        patches.push(f.patch);
      }
    }
    const filteredDiff = patches.join("\n\n");

    const filesChanged = relevantFiles.map((f) => f.filename);

    const stats = {
      additions: relevantFiles.reduce((sum, f) => sum + (f.additions ?? 0), 0),
      deletions: relevantFiles.reduce((sum, f) => sum + (f.deletions ?? 0), 0),
    };

    return {
      commit,
      filesChanged,
      stats,
      filteredDiff,
    };
  },
});
