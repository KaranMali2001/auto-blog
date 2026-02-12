"use node";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { type ActionCtx, internalAction } from "../_generated/server";
import { genAI, MODEL } from "../config/gemini";
import { githubApp } from "../config/github";

const PR_SUMMARY_PROMPT = `You are an expert technical storyteller summarizing a merged pull request for use in blog posts, LinkedIn updates, or Twitter threads.

# YOUR MISSION
Create a rich, coherent summary of this PR that captures the full scope of work. Write in first-person, story-driven format.

# PR DATA

**PR Title**: {prTitle}
**PR Body**: {prBody}
**Base → Head**: {baseRef} → {headRef}
**Commit Messages**:
{commitMessages}

**Optional - File diff summary** (if provided):
{diffSummary}

# GUIDELINES
- Use first-person voice ("I", "we")
- Be specific: mention technologies, patterns, and key decisions
- Connect the PR body and commits into one coherent narrative
- Include relevant tags: #feature, #bugfix, #refactor, etc.
- If the PR body already explains well, build on it; don't repeat verbatim
- Keep it concise but information-dense (2-4 paragraphs typically)
- No hallucination - only use information from the PR data above

# OUTPUT
Return ONLY the summary text. No preamble or meta-commentary.`;

export const summarizeMergedPrAction = internalAction({
  args: {
    prId: v.id("pullRequests"),
    installationId: v.number(),
    owner: v.string(),
    repo: v.string(),
    prNumber: v.number(),
    prTitle: v.string(),
    prBody: v.string(),
    baseRef: v.string(),
    headRef: v.string(),
  },
  handler: async (ctx: ActionCtx, args) => {
    const app = githubApp();
    const octokit = await app.getInstallationOctokit(args.installationId);

    const { data: prCommits } = await octokit.rest.pulls.listCommits({
      owner: args.owner,
      repo: args.repo,
      pull_number: args.prNumber,
    });
    const commitShas = prCommits.map((c) => c.sha);

    const commitMessages: string[] = [];
    for (const sha of commitShas.slice(0, 30)) {
      try {
        const { data } = await octokit.rest.repos.getCommit({
          owner: args.owner,
          repo: args.repo,
          ref: sha,
        });
        commitMessages.push(`- ${data.commit.message.split("\n")[0]}`);
      } catch {
        commitMessages.push(`- (commit ${sha.slice(0, 7)})`);
      }
    }

    let diffSummary = "";
    try {
      const { data } = await octokit.rest.repos.compareCommits({
        owner: args.owner,
        repo: args.repo,
        base: args.baseRef,
        head: args.headRef,
      });
      const files = data.files ?? [];
      const fileList = files.slice(0, 50).map((f) => `${f.filename}: +${f.additions ?? 0} -${f.deletions ?? 0}`);
      diffSummary = fileList.join("\n");
      if (files.length > 50) diffSummary += `\n... and ${files.length - 50} more files`;
    } catch {
      // Ignore
    }

    const fullPrompt = PR_SUMMARY_PROMPT.replace("{prTitle}", args.prTitle)
      .replace("{prBody}", args.prBody || "(No description)")
      .replace("{baseRef}", args.baseRef)
      .replace("{headRef}", args.headRef)
      .replace("{commitMessages}", commitMessages.join("\n"))
      .replace("{diffSummary}", diffSummary || "(No diff available)");

    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(fullPrompt);
    const summary = result.response.text();

    await ctx.runMutation(internal.schema.pull_request.updatePullRequestSummary, {
      prId: args.prId,
      summarizedPrDiff: summary,
    });
  },
});
