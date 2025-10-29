"use client";

import { useQueryWithStatus } from "@/app/Providers";
import { PageHeader } from "@/components/layoutComponents/page-header";
import { CronSection } from "@/components/settings/cronComponents/cron-settings";
import { GitHubSection } from "@/components/settings/githubComponents/github-integration";
import { ProfileSection } from "@/components/settings/profileComponents/profile-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Github, User2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { ErrorState } from "../ui/error-state";
import { Spinner } from "../ui/spinner";

export function SettingsPage() {
  const { data: user, isPending, isError } = useQueryWithStatus(api.schema.user.getCurrentUser);
  if (isPending) {
    return <Spinner centered title="Loading user..." />;
  }
  if (isError) {
    return <ErrorState title="Error" message="Failed to load user" />;
  }
  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header */}
      <PageHeader title="Settings" description="Manage your profile, integrations, and automation" />

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User2 className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="github" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            GitHub Integration
          </TabsTrigger>
          <TabsTrigger value="crons" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Cron Schedules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileSection user={user} />
        </TabsContent>
        <TabsContent value="github" className="mt-6">
          <GitHubSection user={user} />
        </TabsContent>
        <TabsContent value="crons" className="mt-6">
          <CronSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
