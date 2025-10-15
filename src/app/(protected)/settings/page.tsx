// src/app/(protected)/settings/page.tsx
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";

import { GithubIntegration } from "@/components/settings/github-integration";
import Settings from "@/components/settings/settings";
import { api } from "../../../../convex/_generated/api";

export default async function SettingsPage() {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  if (!token) throw new Error("User not authenticated");

  const userData = await fetchQuery(api.schema.user.getCurrentUser, {}, { token });
  const stats = await fetchQuery(api.schema.user.getUserIntegrationStats, {}, { token });

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen">Loading settings...</div>;
  }

  const userStats = {
    totalBlogs: stats?.blogCount || 0,
    totalRepos: stats?.repoCount || 0,
    totalCommits: stats?.commitCount || 0,
  };

  return (
    <>
      <Settings
        userData={{
          name: userData.name || "",
          email: userData.email,
          imageUrl: userData.imageUrl,
        }}
        userStats={userStats}
      />
      <GithubIntegration userData={userData} />
    </>
  );
}
