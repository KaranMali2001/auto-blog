import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

export const regenerateSummary = internalAction({
  args: {
    installationId: v.number(),
    commitSha: v.string(),
    owner: v.string(),
    repo: v.string(),
    commitId: v.id("commits"),
    previousSummary: v.string(),
    userInput: v.string(),
  },
  handler: async (ctx, args) => {
    const { commit, filesChanged, stats, filteredDiff } = await ctx.runAction(internal.action_helpers.github.getCommitData, {
      installationId: args.installationId,
      commitSha: args.commitSha,
      owner: args.owner,
      repo: args.repo,
    });
    const newSummary = await ctx.runAction(internal.action_helpers.gemini.regenerateSummary, {
      commitMessage: commit.commit.message,
      filesChanged,
      stats,
      fileContent: filteredDiff,
      previousSummary: args.previousSummary,
      userInput: args.userInput,
    });
    await ctx.runMutation(internal.schema.commit.updateCommit, {
      commitId: args.commitId,
      summarizedCommitDiff: newSummary,
    });
  },
});
