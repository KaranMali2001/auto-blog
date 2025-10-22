import { Crons } from "@convex-dev/crons";
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { components, internal } from "../_generated/api";
import { aggregateByUserCron } from "../aggregation";
import { authenticatedMutation, authenticatedQuery } from "../lib/auth";

const crons = new Crons(components.crons);

// Validate cron expression format (basic validation)
function validateCronExpression(cronExpression: string): void {
  const cronParts = cronExpression.trim().split(/\s+/);

  // Cron expressions should have 5 parts: minute hour day month weekday
  if (cronParts.length !== 5) {
    throw new Error("Invalid cron expression. Expected format: 'minute hour day month weekday' (e.g., '0 9 * * *' for daily at 9am)");
  }

  // Basic validation for each part (allow *, numbers, ranges, lists, steps)
  const validPartRegex = /^(\*|(\d+(-\d+)?(,\d+(-\d+)?)*)(\/\d+)?)$/;

  for (let i = 0; i < cronParts.length; i++) {
    if (!validPartRegex.test(cronParts[i])) {
      throw new Error(`Invalid cron expression part '${cronParts[i]}' at position ${i + 1}`);
    }
  }
}
export const userCronSchema = defineTable({
  userId: v.id("users"),
  cronExpression: v.string(),
  status: v.union(v.literal("enabled"), v.literal("disabled")),
  lastRunAt: v.optional(v.number()), // timestamp in ms
  jobId: v.optional(v.string()),
  selectedRepos: v.array(v.id("repos")),
})
  .index("byUserId", ["userId"])
  .index("byStatus", ["status"]);
export const createUserCron = authenticatedMutation({
  args: {
    selectedRepos: v.array(v.id("repos")),
    cronExpression: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate cron expression
    validateCronExpression(args.cronExpression);

    // First create the database entry
    const userCronId = await ctx.db.insert("userCrons", {
      userId: ctx.user._id,
      cronExpression: args.cronExpression,
      status: "enabled",
      selectedRepos: args.selectedRepos,
    });

    // Register the cron job
    const jobId = await crons.register(ctx, { kind: "cron", cronspec: args.cronExpression }, internal.schema.cron_history.executeCronJob, { userCronId });

    // Update with jobId
    await ctx.db.patch(userCronId, { jobId });

    const userCron = await ctx.db.get(userCronId);
    if (!userCron) {
      throw new Error("Failed to retrieve newly created user cron");
    }
    await aggregateByUserCron.insert(ctx, userCron);
    return userCron;
  },
});
export const updateUserCronStatus = authenticatedMutation({
  args: {
    userCronId: v.id("userCrons"),
    status: v.union(v.literal("enabled"), v.literal("disabled")),
    selectedRepos: v.array(v.id("repos")),
    cronExpression: v.string(),
  },
  handler: async (ctx, args) => {
    const oldUserCron = await ctx.db.get(args.userCronId);
    if (!oldUserCron) {
      throw new Error("User cron not found");
    }
    if (oldUserCron.userId !== ctx.user._id) {
      throw new Error("Unauthorized");
    }

    // Validate new cron expression if changed
    if (args.cronExpression !== oldUserCron.cronExpression) {
      validateCronExpression(args.cronExpression);
    }

    // Handle status transitions
    if (oldUserCron.status === "enabled" && args.status === "disabled") {
      // Disabling: delete the cron job
      if (oldUserCron.jobId) {
        await crons.delete(ctx, { id: oldUserCron.jobId });
      }
      await ctx.db.patch(args.userCronId, {
        selectedRepos: args.selectedRepos,
        cronExpression: args.cronExpression,
        status: args.status,
        jobId: undefined,
      });
    } else if (oldUserCron.status === "disabled" && args.status === "enabled") {
      // Enabling: register new cron job
      const jobId = await crons.register(ctx, { kind: "cron", cronspec: args.cronExpression }, internal.schema.cron_history.executeCronJob, { userCronId: args.userCronId });
      await ctx.db.patch(args.userCronId, {
        selectedRepos: args.selectedRepos,
        cronExpression: args.cronExpression,
        status: args.status,
        jobId,
      });
    } else if (oldUserCron.status === "enabled" && args.status === "enabled") {
      // Updating while enabled: delete old, create new
      if (oldUserCron.jobId) {
        await crons.delete(ctx, { id: oldUserCron.jobId });
      }
      const jobId = await crons.register(ctx, { kind: "cron", cronspec: args.cronExpression }, internal.schema.cron_history.executeCronJob, { userCronId: args.userCronId });
      await ctx.db.patch(args.userCronId, {
        selectedRepos: args.selectedRepos,
        cronExpression: args.cronExpression,
        status: args.status,
        jobId,
      });
    } else {
      // Disabled -> Disabled: just update the fields
      await ctx.db.patch(args.userCronId, {
        selectedRepos: args.selectedRepos,
        cronExpression: args.cronExpression,
        status: args.status,
      });
    }
  },
});
export const getUserCronsWithHistory = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    const userCronsHistories = await ctx.db
      .query("cronHistories")
      .filter((q) => q.eq(q.field("userId"), ctx.user._id))
      .collect();
    const userCrons = await ctx.db
      .query("userCrons")
      .filter((q) => q.eq(q.field("userId"), ctx.user._id))
      .collect();

    return {
      userCrons,
      cronHistories: userCronsHistories,
    };
  },
});
export const deleteUserCron = authenticatedMutation({
  args: {
    userCronId: v.id("userCrons"),
  },
  handler: async (ctx, args) => {
    const userCron = await ctx.db.get(args.userCronId);
    if (!userCron) {
      throw new Error("User cron not found");
    }
    if (userCron.userId !== ctx.user._id) {
      throw new Error("Unauthorized");
    }

    if (userCron.jobId) {
      await crons.delete(ctx, { id: userCron.jobId });
    }

    // Delete from aggregate
    await aggregateByUserCron.delete(ctx, userCron);

    // Delete the database entry
    await ctx.db.delete(args.userCronId);
  },
});
