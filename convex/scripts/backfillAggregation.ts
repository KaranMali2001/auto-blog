import { internalMutation } from "../_generated/server";
import { aggregateByCommitCount, aggregateByCommitSummary, aggregateByRepoCount } from "../aggregation";

export const backFillAggregation = internalMutation({
  args: {},
  handler: async (ctx) => {
    const commits = await ctx.db.query("commits").collect();
    for (const c of commits) {
      await aggregateByCommitCount.insert(ctx, c);
      await aggregateByCommitSummary.insert(ctx, c);
    }

    const repos = await ctx.db.query("repos").collect();
    for (const r of repos) {
      await aggregateByRepoCount.insert(ctx, r);
    }
    return "backfill done";
  },
});
