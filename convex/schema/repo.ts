import { defineTable } from "convex/server";
import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "../_generated/server";

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
    const repo = ctx.db.insert("repos", args);
    return repo;
  },
});
export const getRepos = query({
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
    return ctx.db
      .query("repos")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
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
