"use node";
import { Octokit } from "octokit";

export async function getCommitDiff(installationToken: string, owner: string, repo: string, commitSha: string) {
  const octokit = new Octokit({ auth: installationToken });

  const response = await octokit.request("GET /repos/{owner}/{repo}/commits/{ref}", {
    owner,
    repo,
    ref: commitSha,
    headers: {
      // Request diff instead of JSON
      accept: "application/vnd.github.v3.diff",
    },
  });

  return response.data; // This is the diff content
}
