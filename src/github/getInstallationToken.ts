import { githubApp } from "@/config/github";

export async function getInstallationToken(installationId: number) {
  const app = githubApp();
  const octokit = await app.getInstallationOctokit(installationId);
  const tokenResponse = await octokit.request("POST /app/installations/{installation_id}/access_tokens", {
    installation_id: installationId,
  });
  console.log("tokenResponse", tokenResponse.data);
  return tokenResponse.data.token; // tokenResponse is already a string token
}
