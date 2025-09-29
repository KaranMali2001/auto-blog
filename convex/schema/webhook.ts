import { defineTable } from "convex/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

export const webhookSchema = defineTable({
  webhooK_platform: v.union(v.literal("github"), v.literal("clerk")),
  webhook_event: v.string(),
  webhook_status: v.union(v.literal("success"), v.literal("failed"), v.literal("pending")),
  webhook_data: v.any(),
  webhook_createdAt: v.string(),
  webhook_updatedAt: v.string(),
  lastAttemptedAt: v.optional(v.string()),
  attempts: v.optional(v.number()),
});
export const storeAndSchedule = internalMutation({
  args: {
    webhooK_platform: v.union(v.literal("github"), v.literal("clerk")),
    webhook_event: v.string(),
    webhook_status: v.union(v.literal("success"), v.literal("failed"), v.literal("pending")),
    webhook_data: v.any(),
    webhook_createdAt: v.string(),
    webhook_updatedAt: v.string(),
    installation_id: v.number(),
  },
  handler: async (ctx, args) => {
    const { webhooK_platform, webhook_event, webhook_status, webhook_data, installation_id } = args;
    const webhook = await ctx.db.insert("webhooks", {
      webhooK_platform,
      webhook_event,
      webhook_status,
      webhook_data,
      webhook_createdAt: Date.now().toString(),
      webhook_updatedAt: Date.now().toString(),
    });
    await ctx.scheduler.runAfter(0, internal.action_helpers.github.getCommitDIffAction, {
      installationId: installation_id,
      github_url: webhook_data.repository.html_url,
      commitSha: webhook_data.after,
      id: webhook,
    });
    return webhook;
  },
});
export const updateStatus = internalMutation({
  args: {
    id: v.id("webhooks"),
    status: v.union(v.literal("success"), v.literal("failed"), v.literal("pending")),
  },
  handler: async (ctx, args) => {
    const { id, status } = args;
    const webhook = ctx.db.patch(id, {
      webhook_status: status,
      webhook_updatedAt: Date.now().toString(),
    });
    return webhook;
  },
});
