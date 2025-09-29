// app/api/github-webhook/route.ts
import { env } from "@/env";
import { getCommitDiff } from "@/github/getCommitDIff";
import { getInstallationToken } from "@/github/getInstallationToken";
import { GitHubWebhookPayload } from "@/types/github";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
const WEBHOOK_SECRET: string = env.GITHUB_WEBHOOK_SECREAT;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: string = await req.text();
  const signature: string = req.headers.get("x-hub-signature-256") || "";

  // Verify webhook signature
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest: string = `sha256=${hmac.update(body).digest("hex")}`;

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload: GitHubWebhookPayload = JSON.parse(body);

  const event: string | null = req.headers.get("x-github-event");

  if (event === "push") {
    const installationId: number = payload.installation.id;
    const accessToken: string = await getInstallationToken(installationId);
    const diff = await getCommitDiff(accessToken, payload.repository.owner.login, payload.repository.name, payload.commits[0].id);
  }

  return NextResponse.json({ status: "ok" });
}
