import { defineTable } from "convex/server";
import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { aggregateByRepoCount } from "../aggregation";
import { authenticatedQuery } from "../lib/auth";

export const repoSchema = defineTable({
  name: v.string(),
  repoUrl: v.string(),
  installationId: v.number(),
  userId: v.id("users"),
})
  .index("byName", ["name"])
  .index("byUserId", ["userId"]);

export const createRepo = internalMutation({
  args: { name: v.string(), repoUrl: v.string(), installationId: v.number(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const repoId = await ctx.db.insert("repos", args);
    const repo = await ctx.db.get(repoId);

    if (!repo) {
      throw new Error("Failed to retrieve newly created repo");
    }

    await aggregateByRepoCount.insert(ctx, repo);
    return repoId;
  },
});
export const getRepos = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("repos")
      .withIndex("byUserId", (q) => q.eq("userId", ctx.user._id))
      .collect();
  },
});
export const getRepoByInstallation = internalQuery({
  args: {
    installationId: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("repos")
      .filter((q) => q.eq(q.field("installationId"), args.installationId))
      .unique();
  },
});
