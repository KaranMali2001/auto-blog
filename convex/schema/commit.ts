import { defineTable, paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation, internalQuery } from "../_generated/server";
import { aggregateByCommitCount, aggregateByCommitSummary } from "../aggregation";
import { authenticatedMutation, authenticatedQuery } from "../lib/auth";

export const commitSchema = defineTable({
  commitSha: v.string(),
  summarizedCommitDiff: v.optional(v.string()),
  commitMessage: v.string(),
  commitAuthor: v.optional(v.string()),
  previousSummary: v.optional(v.string()),
  lastRegeneratedAt: v.optional(v.number()),
  commitRepositoryUrl: v.string(),
  repoId: v.id("repos"),
  userId: v.id("users"),
})
  .index("byCommitSha", ["commitSha"])
  .index("byUserId", ["userId"])
  .index("byRepoId", ["repoId"]);
export const createCommit = internalMutation({
  args: {
    commitSha: v.string(),
    commitMessage: v.string(),
    commitAuthor: v.string(),
    commitRepositoryUrl: v.string(),
    repoId: v.id("repos"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const commitId = await ctx.db.insert("commits", args);
    const commit = await ctx.db.get(commitId);
    if (!commit) {
      throw new Error("Failed to retrieve newly created commit");
    }
    await aggregateByCommitCount.insert(ctx, commit);
    await aggregateByCommitSummary.insert(ctx, commit);
    return commit;
  },
});
export const updateCommit = internalMutation({
  args: { summarizedCommitDiff: v.string(), commitId: v.id("commits") },
  handler: async (ctx, args) => {
    const oldCommit = await ctx.db.get(args.commitId);
    if (!oldCommit) {
      throw new Error("Commit not found");
    }

    await ctx.db.patch(args.commitId, {
      previousSummary: oldCommit.summarizedCommitDiff,
      summarizedCommitDiff: args.summarizedCommitDiff,
      lastRegeneratedAt: Date.now(),
    });

    const updatedCommit = await ctx.db.get(args.commitId);
    if (!updatedCommit) {
      throw new Error("Failed to retrieve updated commit");
    }

    // Update the aggregate when summary changes from empty to filled
    await aggregateByCommitSummary.replace(ctx, oldCommit, updatedCommit);

    return updatedCommit;
  },
});
export const getCommits = authenticatedQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const commits = await ctx.db
      .query("commits")
      .withIndex("byUserId", (q) => q.eq("userId", ctx.user._id))
      .order("desc")
      .paginate(paginationOpts);
    return {
      ...commits,
      page: commits.page.map(({ summarizedCommitDiff, ...rest }) => rest),
    };
  },
});

export const getCommitsByRepoIdAndSince = internalQuery({
  args: { repoId: v.id("repos"), userId: v.id("users"), since: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("commits")
      .withIndex("byRepoId", (q) => q.eq("repoId", args.repoId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.gte(q.field("_creationTime"), args.since))
      .order("desc")
      .take(50);
  },
});

export const getCommitsByRepoIdsAndSince = internalQuery({
  args: { repoIds: v.array(v.id("repos")), userId: v.id("users"), since: v.number() },
  handler: async (ctx, args) => {
    const repoIdSet = new Set(args.repoIds);
    const all: Awaited<ReturnType<typeof ctx.db.query>>[] = [];
    for (const repoId of args.repoIds) {
      const commits = await ctx.db
        .query("commits")
        .withIndex("byRepoId", (q) => q.eq("repoId", repoId))
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .filter((q) => q.gte(q.field("_creationTime"), args.since))
        .order("desc")
        .take(20);
      all.push(...commits);
    }
    return all.sort((a, b) => b._creationTime - a._creationTime).slice(0, 30);
  },
});

export const getCommitById = authenticatedQuery({
  args: { commitId: v.id("commits") },
  handler: async (ctx, args) => {
    const commit = await ctx.db.get(args.commitId);
    if (!commit || commit.userId !== ctx.user._id) {
      throw new Error("Commit not found");
    }
    return commit;
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
    await aggregateByCommitSummary.delete(ctx, commit);
    await ctx.db.delete(args.commitId);
  },
});
export const updateSummary = authenticatedMutation({
  args: { commitId: v.id("commits"), summarizedCommitDiff: v.string() },
  handler: async (ctx, args) => {
    const oldCommit = await ctx.db.get(args.commitId);
    if (!oldCommit || oldCommit.userId !== ctx.user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.commitId, {
      summarizedCommitDiff: args.summarizedCommitDiff,
    });

    const updatedCommit = await ctx.db.get(args.commitId);
    if (!updatedCommit) {
      throw new Error("Failed to retrieve updated commit");
    }

    // Update the aggregate when summary changes
    await aggregateByCommitSummary.replace(ctx, oldCommit, updatedCommit);
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
export const getRelatedCommits = authenticatedQuery({
  args: { blogId: v.id("blogs") },
  handler: async (ctx, args) => {
    const blog = await ctx.db.get(args.blogId);
    if (!blog || blog.userId !== ctx.user._id) {
      throw new Error("Unauthorized");
    }
    const commitIds = blog.commitIds;
    return (await Promise.all(commitIds.map((id) => ctx.db.get(id)))).filter((commit) => commit !== null);
  },
});
