import { Webhook } from "svix";

import { GitHubWebhookPayload } from "@/types/github";
import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";

const CLERK_WEBHOOK_SECRET: string = process.env.CLERK_WEBHOOK_SECRET!;

export const githubWebhook = httpAction(async (ctx, req) => {
  try {
    const body: string = await req.text();
    const success = await ctx.runAction(internal.action_helpers.github.VerifyGithubWebhookAction, {
      signature: req.headers.get("x-hub-signature-256") || "",
      body,
    });
    if (!success) {
      return new Response("Invalid signature", { status: 401 });
    }
    const payload: GitHubWebhookPayload = JSON.parse(body);

    const event: string | null = req.headers.get("x-github-event");

    if (event === "push") {
      await ctx.runMutation(internal.schema.webhook.storeAndSchedule, {
        webhook_platform: "github",
        webhook_event: event,
        webhook_status: "pending",
        webhook_data: payload,
        webhook_createdAt: Date.now().toString(),
        webhook_updatedAt: Date.now().toString(),
        installation_id: payload.installation.id,
      });

      return new Response("ok", { status: 200 });
    }
    if (event === "installation") {
      if (payload.action === "deleted" || payload.action === "updated") {
        const res = await ctx.runMutation(internal.schema.user.updateInstalltionId, {
          action: payload.action,
          installationId: payload.installation.id,
          repositories: payload.repositories.map((r) => r.full_name),
        });
        if (res == false) {
          return new Response("User not found", { status: 400 });
        }
      }
    }
    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Error processing github webhook:", error);
    return new Response("Error processing github webhook", { status: 500 });
  }
});

export const clerkWebhook = httpAction(async (ctx, req) => {
  try {
    const payload = await req.text();
    const headers = {
      "svix-id": req.headers.get("svix-id") || "",
      "svix-timestamp": req.headers.get("svix-timestamp") || "",
      "svix-signature": req.headers.get("svix-signature") || "",
    };

    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payload, headers) as any;

    const { id } = evt.data;
    const eventType = evt.type;

    if (eventType === "user.created") {
      if (!id) {
        return new Response("Invalid user id", { status: 400 });
      }

      await ctx.runMutation(internal.schema.user.createUser, {
        clerkId: id,
        email: evt.data.email_addresses[0].email_address,
        name: evt.data.first_name || undefined,
        imageUrl: evt.data.image_url,
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
      });
      return new Response("ok", { status: 200 });
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Error processing Clerk webhook:", error);
    return new Response("Error processing Clerk webhook", { status: 500 });
  }
});
