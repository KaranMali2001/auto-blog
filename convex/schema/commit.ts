import { defineTable } from "convex/server";
import { v } from "convex/values";
import { internalMutation, query } from "../_generated/server";

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
    const commit = ctx.db.insert("commits", args);
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
export const getCommits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }
    const commits = await ctx.db
      .query("commits")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .collect();

    console.log("commits", commits);
    return commits;
  },
});
