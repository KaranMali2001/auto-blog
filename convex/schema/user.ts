import { defineTable } from "convex/server";
import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";

export const UserSchema = defineTable({
  clerkId: v.string(),
  name: v.optional(v.string()),
  imageUrl: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  installationId: v.optional(v.number()),
});
export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const { clerkId, name, imageUrl, createdAt, updatedAt } = args;
    const user = ctx.db.insert("users", { clerkId, name, imageUrl, createdAt, updatedAt });
    return user;
  },
});
export const getCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    console.log("Current user:", user);
    return user;
  },
});
