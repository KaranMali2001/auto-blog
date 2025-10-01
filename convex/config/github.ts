import { App } from "octokit";

let _githubAppInstance: App | null = null;

export const githubApp = () => {
  if (!_githubAppInstance) {
    _githubAppInstance = new App({
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_PRIVATE_KEY!,
      oauth: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    });
  }
  return _githubAppInstance;
};
