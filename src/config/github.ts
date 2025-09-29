import jwt from "jsonwebtoken";
import { App } from "octokit";

export let jwtToken: string;

export const githubApp = () =>
  new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_PRIVATE_KEY!,
    oauth: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  });

export function generateJWTForInstallation() {
  if (!jwtToken) {
    console.log("creating new jwt token....");
    const payload = {
      iat: Math.floor(Date.now() / 1000), // Issued at time
      exp: Math.floor(Date.now() / 1000) + 10 * 60, // Expires in 10 minutes
      iss: process.env.GITHUB_APP_ID!, // Your GitHub App ID
    };
    jwtToken = jwt.sign(payload, process.env.GITHUB_PRIVATE_KEY!, { algorithm: "RS256" });
  }
  return jwtToken;
}
