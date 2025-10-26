import { internalMutation } from "../_generated/server";
import { aggregateByCommitCount, aggregateByCommitSummary, aggregateByRepoCount, aggregateByTotalBlogCount } from "../aggregation";

export const backFillAggregation = internalMutation({
  args: {},
  handler: async (ctx) => {
    let commitCount = 0;
    let repoCount = 0;
    let blogCount = 0;
    let deletedCount = 0;

    console.log("Starting aggregation backfill...");

    // Get all users
    const users = await ctx.db.query("users").collect();
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      console.log(`Processing user ${user._id}...`);

      // Step 1: Clear existing aggregates for this user by deleting all entries
      console.log(`Clearing existing aggregates for user ${user._id}...`);

      // Get all blogs and clear them from aggregate
      const existingBlogs = await ctx.db
        .query("blogs")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .collect();

      for (const blog of existingBlogs) {
        try {
          await aggregateByTotalBlogCount.delete(ctx, blog);
          deletedCount++;
        } catch (error) {
          console.warn("Error deleting blog from aggregate:", error);
          // Entry doesn't exist in aggregate, that's fine
        }
      }

      // Get all commits and clear them from aggregate
      const existingCommits = await ctx.db
        .query("commits")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .collect();

      for (const commit of existingCommits) {
        try {
          await aggregateByCommitCount.delete(ctx, commit);
          await aggregateByCommitSummary.delete(ctx, commit);
        } catch (_error) {
          // Entry doesn't exist in aggregate, that's fine
        }
      }

      // Get all repos and clear them from aggregate
      const existingRepos = await ctx.db
        .query("repos")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .collect();

      for (const repo of existingRepos) {
        try {
          await aggregateByRepoCount.delete(ctx, repo);
        } catch (_error) {
          // Entry doesn't exist in aggregate, that's fine
        }
      }

      console.log(`Cleared aggregates for user ${user._id}`);

      // Step 2: Rebuild aggregates from scratch
      console.log(`Rebuilding aggregates for user ${user._id}...`);

      // Rebuild commits
      for (const commit of existingCommits) {
        try {
          await aggregateByCommitCount.insert(ctx, commit);
          await aggregateByCommitSummary.insert(ctx, commit);
          commitCount++;
        } catch (error) {
          console.error(`Failed to insert commit ${commit._id}:`, error);
        }
      }

      // Rebuild repos
      for (const repo of existingRepos) {
        try {
          await aggregateByRepoCount.insert(ctx, repo);
          repoCount++;
        } catch (error) {
          console.error(`Failed to insert repo ${repo._id}:`, error);
        }
      }

      // Rebuild blogs
      for (const blog of existingBlogs) {
        try {
          await aggregateByTotalBlogCount.insert(ctx, blog);
          blogCount++;
        } catch (error) {
          console.error(`Failed to insert blog ${blog._id}:`, error);
        }
      }

      console.log(`Completed user ${user._id}: ${existingCommits.length} commits, ${existingRepos.length} repos, ${existingBlogs.length} blogs`);
    }

    const result = {
      message: "Backfill completed successfully",
      stats: {
        usersProcessed: users.length,
        commitsRebuilt: commitCount,
        reposRebuilt: repoCount,
        blogsRebuilt: blogCount,
        entriesCleared: deletedCount,
      },
    };

    console.log("Backfill result:", result);
    return result;
  },
});
