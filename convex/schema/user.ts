import { defineTable } from "convex/server";
import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";

export const UserSchema = defineTable({
  clerkId: v.string(),
  email: v.string(),
  name: v.optional(v.string()),
  imageUrl: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  installationId: v.optional(v.number()),
}).index("byClerkId", ["clerkId"]);
export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const { clerkId, name, imageUrl, createdAt, updatedAt, email } = args;
    const user = ctx.db.insert("users", { clerkId, name, imageUrl, createdAt, updatedAt, email });
    return user;
  },
});

export const updateInstattionId = mutation({
  args: {
    installationId: v.number(),
  },
  handler: async (ctx, args) => {
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
    await ctx.db.patch(user._id, {
      installationId: args.installationId,
    });
  },
});
export const getUserByinstallationId = internalQuery({
  args: {
    installationId: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("installationId"), args.installationId))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
});
export const getCurrentUser = query({
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
    return user;
  },
});
