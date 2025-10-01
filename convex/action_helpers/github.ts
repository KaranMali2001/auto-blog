"use node";
import { v } from "convex/values";
import crypto from "crypto";
import { Octokit } from "octokit";
import { internal } from "../_generated/api";
import { ActionCtx, internalAction } from "../_generated/server";
import { githubApp } from "../config/github";
const WEBHOOK_SECRET: string = process.env.GITHUB_WEBHOOK_SECRET!;

export const getCommitDIffAction = internalAction({
  args: { installationId: v.number(), github_url: v.string(), commitSha: v.string(), id: v.id("webhooks") },
  handler: async (ctx: ActionCtx, args) => {
    try {
      const owner = args.github_url.split("/")[3];
      const repo = args.github_url.split("/")[4];
      const app = githubApp();
      const tempOctokit = await app.getInstallationOctokit(args.installationId);
      const tokenResponse = await tempOctokit.request("POST /app/installations/{installation_id}/access_tokens", {
        installation_id: args.installationId,
      });

      const octokit = new Octokit({ auth: tokenResponse.data.token });

      const response = await octokit.request("GET /repos/{owner}/{repo}/commits/{ref}", {
        owner,
        repo,
        ref: args.commitSha,
        headers: {
          accept: "application/vnd.github.v3.diff",
        },
      });
      console.log("response Git Diff Not saving Yet", response.data);
      await ctx.runMutation(internal.schema.webhook.updateStatus, {
        id: args.id,
        status: "success",
      });
    } catch (error) {
      await ctx.runMutation(internal.schema.webhook.updateStatus, {
        id: args.id,
        status: "failed",
      });
      console.error("Error getting commit diff:", error);
      return null;
    }
  },
});

export const VerifyGithubWebhookAction = internalAction({
  args: { signature: v.string(), body: v.string() },
  handler: async (ctx: ActionCtx, args): Promise<boolean> => {
    const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
    const digest: string = `sha256=${hmac.update(args.body).digest("hex")}`;

    if (!crypto.timingSafeEqual(Buffer.from(args.signature), Buffer.from(digest))) {
      return false;
    }
    return true;
  },
});
