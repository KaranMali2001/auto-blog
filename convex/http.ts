import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { getInstallationUrl } from "./handlers/github";
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
http.route({
  path: "/api/installationUrl",
  method: "GET",
  handler: getInstallationUrl,
});

http.route({
  path: "/api/installationUrl",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: new Headers({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      }),
    });
  }),
});

export default http;
