import { defineTable } from "convex/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation, internalQuery } from "../_generated/server";

export const pullRequestSchema = defineTable({
  repoId: v.id("repos"),
  userId: v.id("users"),
  prNumber: v.number(),
  title: v.string(),
  body: v.optional(v.string()),
  state: v.string(),
  mergedAt: v.optional(v.number()),
  baseRef: v.string(),
  headRef: v.string(),
  commitShas: v.array(v.string()),
  summarizedPrDiff: v.optional(v.string()),
  repoUrl: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("byRepoId", ["repoId"])
  .index("byUserId", ["userId"])
  .index("byUserIdAndMergedAt", ["userId", "mergedAt"]);

export const createPullRequest = internalMutation({
  args: {
    repoId: v.id("repos"),
    userId: v.id("users"),
    prNumber: v.number(),
    title: v.string(),
    body: v.optional(v.string()),
    state: v.string(),
    mergedAt: v.optional(v.number()),
    baseRef: v.string(),
    headRef: v.string(),
    commitShas: v.array(v.string()),
    repoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("pullRequests", {
      ...args,
      mergedAt: args.mergedAt ?? now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const storeAndSchedulePrSummary = internalMutation({
  args: {
    installationId: v.number(),
    repoUrl: v.string(),
    prNumber: v.number(),
    prTitle: v.string(),
    prBody: v.optional(v.string()),
    baseRef: v.string(),
    headRef: v.string(),
    repoId: v.id("repos"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const mergedAt = Date.now();
    const prId = await ctx.db.insert("pullRequests", {
      repoId: args.repoId,
      userId: args.userId,
      prNumber: args.prNumber,
      title: args.prTitle,
      body: args.prBody,
      state: "closed",
      mergedAt,
      baseRef: args.baseRef,
      headRef: args.headRef,
      commitShas: [],
      repoUrl: args.repoUrl,
      createdAt: mergedAt,
      updatedAt: mergedAt,
    });
    const [owner, repo] = args.repoUrl.replace("https://github.com/", "").split("/");
    await ctx.scheduler.runAfter(0, internal.action_helpers.pr.summarizeMergedPrAction, {
      prId,
      installationId: args.installationId,
      owner: owner ?? "",
      repo: repo ?? "",
      prNumber: args.prNumber,
      prTitle: args.prTitle,
      prBody: args.prBody ?? "",
      baseRef: args.baseRef,
      headRef: args.headRef,
    });
  },
});

export const updatePullRequestSummary = internalMutation({
  args: {
    prId: v.id("pullRequests"),
    summarizedPrDiff: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.prId, {
      summarizedPrDiff: args.summarizedPrDiff,
      updatedAt: Date.now(),
    });
  },
});

export const getPullRequestsByUserIdAndTimeRange = internalQuery({
  args: {
    userId: v.id("users"),
    repoIds: v.array(v.id("repos")),
    since: v.number(),
  },
  handler: async (ctx, args) => {
    const repoIdSet = new Set(args.repoIds);
    const prs = await ctx.db
      .query("pullRequests")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .collect();
    return prs.filter((pr) => pr.mergedAt && pr.mergedAt >= args.since && repoIdSet.has(pr.repoId));
  },
});
