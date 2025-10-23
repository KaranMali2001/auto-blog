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

// Convert Indian time to UTC for cron scheduling
function convertIndianTimeToUTC(hour: number, minute: number): string {
  // IST is UTC+5:30, so we subtract 5 hours and 30 minutes
  let utcHour = hour - 5;
  let utcMinute = minute - 30;

  // Handle minute overflow
  if (utcMinute < 0) {
    utcMinute += 60;
    utcHour -= 1;
  }

  // Handle hour overflow (previous day)
  if (utcHour < 0) {
    utcHour += 24;
  }

  // Handle hour overflow (next day)
  if (utcHour >= 24) {
    utcHour -= 24;
  }

  return `${utcMinute} ${utcHour} * * *`;
}

// Parse cron expression to extract hour and minute
function parseCronExpression(cronExpression: string): { hour: number; minute: number } {
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error("Invalid cron expression format");
  }

  const minute = parseInt(parts[0]);
  const hour = parseInt(parts[1]);

  if (isNaN(minute) || isNaN(hour)) {
    throw new Error("Invalid hour or minute in cron expression");
  }

  return { hour, minute };
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

    // Parse the cron expression to get hour and minute
    const { hour, minute } = parseCronExpression(args.cronExpression);

    // Convert Indian time to UTC
    const utcCronExpression = convertIndianTimeToUTC(hour, minute);

    console.log(`Converting Indian time ${hour}:${minute.toString().padStart(2, "0")} to UTC cron: ${utcCronExpression}`);

    // First create the database entry with original Indian time expression
    const userCronId = await ctx.db.insert("userCrons", {
      userId: ctx.user._id,
      cronExpression: args.cronExpression, // Store original Indian time
      status: "enabled",
      selectedRepos: args.selectedRepos,
    });

    console.log("registering cron job", utcCronExpression, userCronId);
    const jobId = await crons.register(ctx, { kind: "cron", cronspec: utcCronExpression }, internal.schema.cron_history.executeCronJob, { userCronId }, `cron_${userCronId}`);
    console.log("registered cron job", jobId);
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

    // Convert Indian time to UTC for cron scheduling
    let utcCronExpression = args.cronExpression;
    if (args.status === "enabled") {
      const { hour, minute } = parseCronExpression(args.cronExpression);
      utcCronExpression = convertIndianTimeToUTC(hour, minute);
      console.log(`Converting Indian time ${hour}:${minute.toString().padStart(2, "0")} to UTC cron: ${utcCronExpression}`);
    }

    // Handle status transitions
    if (oldUserCron.status === "enabled" && args.status === "disabled") {
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
      // Enabling: register new cron job with UTC time
      const jobId = await crons.register(ctx, { kind: "cron", cronspec: utcCronExpression }, internal.schema.cron_history.executeCronJob, { userCronId: args.userCronId }, `cron_${args.userCronId}`);
      await ctx.db.patch(args.userCronId, {
        selectedRepos: args.selectedRepos,
        cronExpression: args.cronExpression,
        status: args.status,
        jobId,
      });
    } else if (oldUserCron.status === "enabled" && args.status === "enabled") {
      // Updating while enabled: delete old, create new with UTC time
      if (oldUserCron.jobId) {
        await crons.delete(ctx, { id: oldUserCron.jobId });
      }
      const jobId = await crons.register(ctx, { kind: "cron", cronspec: utcCronExpression }, internal.schema.cron_history.executeCronJob, { userCronId: args.userCronId }, `cron_${args.userCronId}`);
      await ctx.db.patch(args.userCronId, {
        selectedRepos: args.selectedRepos,
        cronExpression: args.cronExpression,
        status: args.status,
        jobId,
      });
    } else {
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
