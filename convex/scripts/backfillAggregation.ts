import { internalMutation } from "../_generated/server";
import {
  aggregateByCommitCount,
  aggregateByCommitSummary,
  aggregateByRepoCount,
  aggregateByTotalBlogCount,
} from "../aggregation";

export const backFillAggregation = internalMutation({
  args: {},
  handler: async (ctx) => {
    let commitCount = 0;
    let repoCount = 0;
    let blogCount = 0;

    // Get all users to check what's already aggregated
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      // Backfill commits for this user
      const existingCommitCount = await aggregateByCommitCount.count(ctx, { namespace: user._id });
      const totalCommits = await ctx.db
        .query("commits")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .collect();

      if (existingCommitCount < totalCommits.length) {
        // Need to backfill - clear and re-add to be safe
        for (const c of totalCommits) {
          try {
            await aggregateByCommitCount.insert(ctx, c);
            await aggregateByCommitSummary.insert(ctx, c);
            commitCount++;
          } catch (error) {
            // Already exists, skip
            console.log(`Skipping commit ${c._id}, already aggregated`);
          }
        }
      }

      // Backfill repos for this user
      const existingRepoCount = await aggregateByRepoCount.count(ctx, { namespace: user._id });
      const totalRepos = await ctx.db
        .query("repos")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .collect();

      if (existingRepoCount < totalRepos.length) {
        for (const r of totalRepos) {
          try {
            await aggregateByRepoCount.insert(ctx, r);
            repoCount++;
          } catch (error) {
            console.log(`Skipping repo ${r._id}, already aggregated`);
          }
        }
      }

      // Backfill blogs for this user
      const existingBlogCount = await aggregateByTotalBlogCount.count(ctx, { namespace: user._id });
      const totalBlogs = await ctx.db
        .query("blogs")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .collect();

      if (existingBlogCount < totalBlogs.length) {
        for (const b of totalBlogs) {
          try {
            await aggregateByTotalBlogCount.insert(ctx, b);
            blogCount++;
          } catch (error) {
            console.log(`Skipping blog ${b._id}, already aggregated`);
          }
        }
      }
    }

    return {
      message: "Backfill completed",
      stats: {
        commitsAdded: commitCount,
        reposAdded: repoCount,
        blogsAdded: blogCount,
      },
    };
  },
});
