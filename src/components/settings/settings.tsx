"use client";

import { CronSection } from "@/components/settings/cron-settings";
import { GitHubSection } from "@/components/settings/github-integration";
import { ProfileSection } from "@/components/settings/profile-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types";
import { Calendar, Github, User2 } from "lucide-react";

export function SettingsPage({ user }: { user: User }) {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your profile, integrations, and automation</p>
      </div>

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
