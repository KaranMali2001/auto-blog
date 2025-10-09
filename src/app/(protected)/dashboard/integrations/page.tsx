"use client";

import { SignOutButton, useAuth } from "@clerk/nextjs";
import { Activity, FileText, GitBranch, Github } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useQueryWithStatus } from "@/app/Providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoaderWithText from "@/components/ui/loading";
import { axiosInstance } from "@/lib/axios";
import { api } from "../../../../../convex/_generated/api";

export default function DashboardPage() {
  const { getToken, isLoaded } = useAuth();
  const { data: user, isPending } = useQueryWithStatus(api.schema.user.getCurrentUser);
  const { data: stats, isPending: statsPending } = useQueryWithStatus(api.schema.user.getUserIntegrationStats);
  const [authUrl, setAuthUrl] = useState<string>("");
  const [fetchError, setFetchError] = useState<string>("");

  useEffect(() => {
    if (!user || user.installationId) return;

    const fetchAuthUrl = async () => {
      try {
        const token = await getToken({ template: "convex" });

        const response = await axiosInstance.get("/api/installationUrl", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setAuthUrl(response.data.authUrl);
        } else {
          throw new Error("Failed to get GitHub installation URL");
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Something went wrong");
        setFetchError(err.message || "Failed to get GitHub installation URL");
      }
    };

    fetchAuthUrl();
  }, [getToken, user]);

  // Loading state
  if (!isLoaded || isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoaderWithText text="Loading dashboard..." />
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 text-muted-foreground min-h-screen bg-background">
        <p>You are not authenticated. Redirecting to sign in...</p>
        <Link href="/sign-in" className="text-primary underline hover:text-primary/80 transition-colors">
          Go Back To Sign In
        </Link>
      </div>
    );
  }

  // Already integrated - show stats and dashboard link
  if (user.installationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 pt-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Welcome Back!</h1>
            <p className="text-muted-foreground">Your GitHub integration is active</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {statsPending ? (
              // Skeleton loaders
              <>
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : stats ? (
              <>
                <Card className="border-border/50 bg-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Repositories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.repoCount}</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Commits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.commitCount}</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Summaries
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.summaryCount}</p>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>

          {/* Action Card */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle>Ready to Create?</CardTitle>
              <CardDescription>Your GitHub is connected and ready. Head to your dashboard to start creating blog posts.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <SignOutButton>
                <Button variant="outline" className="flex-1">
                  Sign Out
                </Button>
              </SignOutButton>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // GitHub connection flow
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Github className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Connect GitHub</h1>
          <p className="text-muted-foreground">One step away from automating your blog</p>
        </div>

        {/* Connection Card */}
        {authUrl ? (
          <Card className="border-border/50 bg-card shadow-lg">
            <CardHeader>
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>Auto Blog needs access to create and manage repositories for your blog posts. You'll be able to review and configure permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full" size="lg">
                <Link href={authUrl} className="flex items-center justify-center gap-2">
                  <Github className="h-5 w-5" />
                  Connect GitHub Account
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">By connecting, you agree to grant Auto Blog the necessary permissions</p>
            </CardContent>
          </Card>
        ) : fetchError ? (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Connection Error</CardTitle>
              <CardDescription>{fetchError}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <LoaderWithText text="Preparing connection..." />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
