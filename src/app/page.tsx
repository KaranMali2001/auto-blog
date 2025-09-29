import { githubApp } from "@/config/github";
import { env } from "@/env";
import { randomBytes } from "crypto";
import Link from "next/link";

export default async function Home() {
  const state = randomBytes(16).toString("hex");
  const github = githubApp();
  const baseUrl = await github.getInstallationUrl();

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    state: state,
  } as Record<string, string>); //Added type assertion

  const authUrl = `${baseUrl}?${params.toString()}`;
  return (
    <div>
      <Link href={authUrl}>Login with GitHub</Link>
    </div>
  );
}
