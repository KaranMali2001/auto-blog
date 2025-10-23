"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useQueryWithStatus } from "@/app/Providers";
import { AlertCircle, CheckCircle, Github } from "lucide-react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

type UserProfile = {
  _id: Id<"users">;
  installationId?: number;
  name?: string;
  email: string;
  imageUrl: string;
};

export function GithubIntegration({ userData }: { userData: UserProfile }) {
  const isInstalled = Boolean(userData.installationId);
  const { data: authUrl, error: queryError } = useQueryWithStatus(api.schema.user.getInstallationUrl);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Integration
        </CardTitle>
        <CardDescription>
          {isInstalled ? "Your GitHub account is connected and ready to use." : "Connect your GitHub account to automatically create repositories for your blog posts."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {queryError ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{queryError?.message}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isInstalled ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-yellow-500" />}
                <span>{isInstalled ? "GitHub is connected" : "GitHub is not connected"}</span>
              </div>
              <div className="flex gap-3">
                {authUrl ? (
                  <Button asChild variant={isInstalled ? "outline" : "default"} className="gap-2">
                    <Link href={authUrl}>
                      <Github className="h-5 w-5" />
                      {isInstalled ? "Update" : "Connect GitHub"}
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="gap-2">
                    <Github className="h-5 w-5" />
                    Loading...
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Required permissions: repo, workflow, read:user, user:email</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
