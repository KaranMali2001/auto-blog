import { defineSchema } from "convex/server";
import { blogSchema } from "./schema/blog";
import { commitSchema } from "./schema/commit";
import { cronHistorySchema } from "./schema/cron_history";
import { repoSchema } from "./schema/repo";
import { UserSchema } from "./schema/user";
import { userCronSchema } from "./schema/user_cron";
import { webhookSchema } from "./schema/webhook";

export default defineSchema({
  users: UserSchema,
  webhooks: webhookSchema,
  commits: commitSchema,
  repos: repoSchema,
  blogs: blogSchema,
  userCrons: userCronSchema,
  cronHistories: cronHistorySchema,
});
