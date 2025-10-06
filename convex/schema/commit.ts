import { defineTable } from "convex/server";
import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const commitSchema = defineTable({
  commitSha: v.string(),
  summarizedCommitDiff: v.optional(v.string()),
  commitMessage: v.string(),
  commitAuthor: v.optional(v.string()),
  commitRepositoryUrl: v.string(),

  userId: v.id("users"),
})
  .index("byCommitSha", ["commitSha"])
  .index("byUserId", ["userId"]);
export const createCommit = internalMutation({
  args: {
    commitSha: v.string(),
    commitMessage: v.string(),
    commitAuthor: v.string(),
    commitRepositoryUrl: v.string(),

    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const commit = ctx.db.insert("commits", args);
    return commit;
  },
});
export const updateCommit = internalMutation({
  args: {
    summarizedCommitDiff: v.string(),
    commitId: v.id("commits"),
  },
  handler: async (ctx, args) => {
    const commit = ctx.db.patch(args.commitId, {
      summarizedCommitDiff: args.summarizedCommitDiff,
    });
    return commit;
  },
});
