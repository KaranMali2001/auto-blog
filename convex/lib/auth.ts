import { customMutation, customQuery } from "convex-helpers/server/customFunctions";

import type { MutationCtx, QueryCtx } from "../_generated/server";
import { mutation, query } from "../_generated/server";

async function getUserFromAuth(ctx: QueryCtx | MutationCtx) {
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
}
export const authenticatedQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const user = await getUserFromAuth(ctx);
    return { ctx: { ...ctx, user }, args };
  },
});
export const authenticatedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    const user = await getUserFromAuth(ctx);
    return { ctx: { ...ctx, user }, args };
  },
});
