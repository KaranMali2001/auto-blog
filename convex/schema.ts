import { defineSchema } from "convex/server";
import { UserSchema } from "./schema/user";
import { webhookSchema } from "./schema/webhook";

export default defineSchema({
  users: UserSchema,
  webhooks: webhookSchema,
});
