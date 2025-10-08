"use client";

import { SignOutButton, useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Github } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoaderWithText from "@/components/ui/loading";
import { axiosInstance } from "@/lib/axios";
import { api } from "../../../../../convex/_generated/api";

export default function DashboardPage() {
  const { getToken, isLoaded } = useAuth();
  const user = useQuery(api.schema.user.getCurrentUser);

  const [authUrl, setAuthUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

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
        setError(err.message || "Failed to get GitHub installation URL");
      }
    };

    fetchAuthUrl();
  }, [getToken, user]);

  // Loading state while auth info or user data is fetching
  if (!isLoaded || user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderWithText text="Loading dashboard..." />
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 text-muted-foreground min-h-screen">
        <p>You are not authenticated. Redirecting to sign in...</p>
        <Link href="/sign-in" className="text-primary underline hover:text-primary/80 transition-colors">
          Go Back To Sign In
        </Link>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      {authUrl ? (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect Your GitHub</CardTitle>
            <CardDescription>To get started, connect your GitHub account. This allows Auto Blog to create and manage repositories for your blogs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={authUrl} className="flex items-center justify-center gap-2">
                <Github className="h-5 w-5" />
                Connect Your GitHub Account
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : error ? (
        <div className="text-destructive p-4 rounded bg-destructive/10">{error}</div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <p>You have already integrated your account</p>
          <SignOutButton>
            <Button variant="secondary">Sign Out</Button>
          </SignOutButton>
        </div>
      )}
    </div>
  );
}
