// src/app/(protected)/settings/page.tsx
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";

import { CronSettings } from "@/components/settings/cron-settings";
import { GithubIntegration } from "@/components/settings/github-integration";
import Settings from "@/components/settings/settings";
import { api } from "../../../../convex/_generated/api";

export default async function SettingsPage() {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  if (!token) throw new Error("User not authenticated");

  const userData = await fetchQuery(api.schema.user.getCurrentUser, {}, { token });
  const stats = await fetchQuery(api.schema.user.getUserIntegrationStats, {}, { token });
  const crons = await fetchQuery(api.schema.user_cron.getUserCronsWithHistory, {}, { token });
  const repos = await fetchQuery(api.schema.repo.getRepos, {}, { token });

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen">Loading settings...</div>;
  }

  const userStats = {
    totalBlogs: stats?.blogCount || 0,
    totalRepos: stats?.repoCount || 0,
    totalCommits: stats?.commitCount || 0,
  };

  return (
    <div className="space-y-6">
      <Settings
        userData={{
          name: userData.name || "",
          email: userData.email,
          imageUrl: userData.imageUrl,
        }}
        userStats={userStats}
      />
      <CronSettings />
      <GithubIntegration userData={userData} />
    </div>
  );
}
