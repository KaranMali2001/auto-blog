"use node";
import { shouldExcludeFile } from "@/utils/utils";
import { v } from "convex/values";
import crypto from "crypto";
import { internal } from "../_generated/api";
import { ActionCtx, internalAction } from "../_generated/server";
import { githubApp } from "../config/github";
import { singleCommitPrompt } from "../config/openRouter";
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

      const app = githubApp();
      const installationOctokit = await app.getInstallationOctokit(args.installationId);

      const { data: commit } = await installationOctokit.rest.repos.getCommit({
        owner,
        repo,
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

      const user = await ctx.runQuery(internal.schema.user.getUserByinstallationId, { installationId: args.installationId });
      const repoid = await ctx.runQuery(internal.schema.repo.getRepoByInstallation, {
        installationId: args.installationId,
      });
      if (!repoid) {
        throw new Error("Repo not found");
      }
      const newCommit = await ctx.runMutation(internal.schema.commit.createCommit, {
        commitSha: args.commitSha,
        commitMessage: commit.commit.message,
        commitRepositoryUrl: args.github_url,
        commitAuthor: commit.commit.author?.name || "Unknown",
        repoId: repoid._id,
        userId: user._id,
      });

      await ctx.runMutation(internal.schema.webhook.updateStatus, {
        id: args.id,
        status: "success",
      });
      const commitSummary = await ctx.runAction(internal.action_helpers.gemini.getSummary, {
        commitMessage: commit.commit.message,
        filesChanged,
        stats,
        fileContent: filteredDiff,
        prompt: singleCommitPrompt,
      });
      if (!commitSummary) {
        return null;
      }

      await ctx.runMutation(internal.schema.commit.updateCommit, {
        commitId: newCommit,
        summarizedCommitDiff: commitSummary,
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
  handler: async (ctx: ActionCtx, args): Promise<boolean> => {
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
    for (const repo of repos.data.repositories) {
      await ctx.runMutation(internal.schema.repo.createRepo, {
        name: repo.full_name,
        repoUrl: repo.html_url,
        installationId: args.installationId,
        userId: args.userId,
      });
    }
  },
});
