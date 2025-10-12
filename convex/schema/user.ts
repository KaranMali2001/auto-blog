import { defineTable } from "convex/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action, internalMutation, internalQuery } from "../_generated/server";
import { aggregateByCommitCount, aggregateByCommitSummary, aggregateByRepoCount, aggregateByTotalBlogCount } from "../aggregation";
import { authenticatedQuery } from "../lib/auth";

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

export const updateInstattionId = action({
  args: {
    installationId: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }
    const user = await ctx.runQuery(internal.schema.user.getUserByClerkId, { clerkId: identity.subject });
    await ctx.runAction(internal.action_helpers.github.getInstallationRepo, {
      userId: user._id,
      installationId: args.installationId,
    });

    await ctx.runMutation(internal.schema.user.updateInstallationIdInternal, {
      userId: user._id,
      installationId: args.installationId,
    });
  },
});

export const updateInstallationIdInternal = internalMutation({
  args: {
    userId: v.id("users"),
    installationId: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
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
export const getCurrentUser = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.user;
  },
});
export const updateInstalltionId = internalMutation({
  args: {
    action: v.union(v.literal("deleted"), v.literal("updated")),
    installationId: v.number(),
    repositories: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.action === "deleted") {
      for (const repo of args.repositories) {
        const currentRepo = await ctx.db
          .query("repos")
          .filter((q) => q.and(q.eq(q.field("installationId"), args.installationId), q.eq(q.field("name"), `https://github.com/${repo}`)))
          .unique();

        if (currentRepo) {
          await ctx.db.delete(currentRepo._id);
        }
      }

      return true;
    }
    if (args.action === "updated") {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("installationId"), args.installationId))
        .unique();
      if (!user) {
        return false;
      }
      args.repositories.map((r) => {
        ctx.db.insert("repos", {
          name: r,
          repoUrl: `https://github.com/${r}`,
          installationId: args.installationId,
          userId: user._id,
        });
      });
      return true;
    }
    return false;
  },
});
export const getUserByClerkId = internalQuery({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
});
export const getUserIntegrationStats = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    const [commitCount, repoCount, summaryCount, blogCount] = await Promise.all([
      aggregateByCommitCount.count(ctx, { namespace: ctx.user._id }),
      aggregateByRepoCount.count(ctx, { namespace: ctx.user._id }),
      aggregateByCommitSummary.count(ctx, { namespace: ctx.user._id }),
      aggregateByTotalBlogCount.count(ctx, { namespace: ctx.user._id }),
    ]);
    return {
      commitCount,
      repoCount,
      summaryCount,
      blogCount,
    };
  },
});
