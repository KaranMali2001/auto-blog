import { defineTable } from "convex/server";
import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const repoSchema = defineTable({
  name: v.string(),
  repoUrl: v.string(),
  installationId: v.number(),
  userId: v.id("users"),
})
  .index("byName", ["name"])
  .index("byUserId", ["userId"]);

export const createRepo = internalMutation({
  args: {
    name: v.string(),
    repoUrl: v.string(),
    installationId: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const repo = ctx.db.insert("repos", args);
    return repo;
  },
});
