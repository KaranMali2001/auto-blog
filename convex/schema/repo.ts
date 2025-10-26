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
  .index("byUserId", ["userId"])
  .index("byRepoUrl", ["repoUrl"])
  .index("byInstallationId", ["installationId"]);

export const createRepo = internalMutation({
  args: { name: v.string(), repoUrl: v.string(), installationId: v.number(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("repos")
      .withIndex("byRepoUrl", (q) => q.eq("repoUrl", args.repoUrl))
      .unique();

    if (existing) {
      console.log(`Repo already exists in DB: ${args.name}`);
      return existing._id;
    }

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
    const repos = await ctx.db
      .query("repos")
      .withIndex("byUserId", (q) => q.eq("userId", ctx.user._id))
      .collect();

    return repos.map((repo) => ({
      _id: repo._id,
      name: repo.name,
      repoUrl: repo.repoUrl,
      _creationTime: repo._creationTime,
      userId: repo.userId,
    }));
  },
});
export const getRepoByInstallation = internalQuery({
  args: {
    installationId: v.number(),
    repoUrl: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("repos").filter((q) => q.eq(q.field("installationId"), args.installationId));

    if (args.repoUrl && args.repoUrl.length > 0) {
      query = query.filter((q) => q.or(...(args.repoUrl?.map((url) => q.eq(q.field("repoUrl"), url)) || [])));
    }
    return await query.collect();
  },
});
