import { defineSchema } from "convex/server";
import { blogSchema } from "./schema/blog";
import { commitSchema } from "./schema/commit";
import { repoSchema } from "./schema/repo";
import { UserSchema } from "./schema/user";
import { webhookSchema } from "./schema/webhook";

export default defineSchema({
  users: UserSchema,
  webhooks: webhookSchema,
  commits: commitSchema,
  repos: repoSchema,
  blogs: blogSchema,
});
