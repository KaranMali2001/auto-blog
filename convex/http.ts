import { httpRouter } from "convex/server";
import { clerkWebhook, githubWebhook } from "./handlers/webhook_handlers";

const http = httpRouter();

http.route({
  path: "/api/webhook/github",
  method: "POST",
  handler: githubWebhook,
});

http.route({
  path: "/api/webhook/clerk",
  method: "POST",
  handler: clerkWebhook,
});

export default http;
