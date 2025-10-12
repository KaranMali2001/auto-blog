import { defineTable } from "convex/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import { aggregateByCommitCount } from "../aggregation";
import { authenticatedMutation, authenticatedQuery } from "../lib/auth";

export const commitSchema = defineTable({
  commitSha: v.string(),
  summarizedCommitDiff: v.optional(v.string()),
  commitMessage: v.string(),
  commitAuthor: v.optional(v.string()),
  commitRepositoryUrl: v.string(),
  repoId: v.id("repos"),
  userId: v.id("users"),
})
  .index("byCommitSha", ["commitSha"])
  .index("byUserId", ["userId"])
  .index("byRepoId", ["repoId"]);
export const createCommit = internalMutation({
  args: { commitSha: v.string(), commitMessage: v.string(), commitAuthor: v.string(), commitRepositoryUrl: v.string(), repoId: v.id("repos"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const commitId = await ctx.db.insert("commits", args);
    const commit = await ctx.db.get(commitId);
    if (!commit) {
      throw new Error("Failed to retrieve newly created commit");
    }
    await aggregateByCommitCount.insert(ctx, commit);
    return commit;
  },
});
export const updateCommit = internalMutation({
  args: { summarizedCommitDiff: v.string(), commitId: v.id("commits") },
  handler: async (ctx, args) => {
    const commit = ctx.db.patch(args.commitId, {
      summarizedCommitDiff: args.summarizedCommitDiff,
    });
    return commit;
  },
});
export const getCommits = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    const commits = await ctx.db
      .query("commits")
      .withIndex("byUserId", (q) => q.eq("userId", ctx.user._id))
      .collect();

    return commits;
  },
});
export const deleteCommit = authenticatedMutation({
  args: { commitId: v.id("commits") },
  handler: async (ctx, args) => {
    const commit = await ctx.db.get(args.commitId);
    if (!commit || commit.userId !== ctx.user._id) {
      throw new Error("Unauthorized");
    }
    await aggregateByCommitCount.delete(ctx, commit);
    await ctx.db.delete(args.commitId);
  },
});
export const updateSummary = authenticatedMutation({
  args: { commitId: v.id("commits"), summarizedCommitDiff: v.string() },
  handler: async (ctx, args) => {
    const commit = await ctx.db.get(args.commitId);
    if (!commit || commit.userId !== ctx.user._id) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.commitId, {
      summarizedCommitDiff: args.summarizedCommitDiff,
    });
  },
});
export const regenerateSummary = authenticatedMutation({
  args: { commitId: v.id("commits"), userInput: v.string() },
  handler: async (ctx, args) => {
    const dbCommit = await ctx.db.get(args.commitId);
    if (!dbCommit || dbCommit.userId !== ctx.user._id) {
      throw new Error("Commit not found");
    }
    if (!ctx.user.installationId) {
      throw new Error("User not connected to github");
    }
    await ctx.scheduler.runAfter(0, internal.action_helpers.commit.regenerateSummary, {
      installationId: ctx.user.installationId,
      commitSha: dbCommit.commitSha,
      owner: dbCommit.commitRepositoryUrl.split("/")[3],
      repo: dbCommit.commitRepositoryUrl.split("/")[4],
      commitId: args.commitId,
      previousSummary: dbCommit.summarizedCommitDiff || "",
      userInput: args.userInput,
    });
    return {
      message: "Regenerating summary...",
    };
  },
});

export const getCommitsByIds = authenticatedQuery({
  args: { commitIds: v.array(v.id("commits")) },
  handler: async (ctx, args) => {
    const commits = await Promise.all(
      args.commitIds.map(async (commitId) => {
        const commit = await ctx.db.get(commitId);
        if (!commit || commit.userId !== ctx.user._id) {
          return null;
        }
        return commit;
      })
    );
    return commits.filter((commit): commit is NonNullable<typeof commit> => commit !== null);
  },
});
