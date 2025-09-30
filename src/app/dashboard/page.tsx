import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { githubApp } from "@/config/github";

import { env } from "@/env";
import { randomBytes } from "crypto";
import { Github } from "lucide-react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";

export default async function DashboardPage() {
  const state = randomBytes(16).toString("hex");
  const github = githubApp();
  const baseUrl = await github.getInstallationUrl();

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    state: state,
  });

  const authUrl = `${baseUrl}?${params.toString()}`;
  const currentUser = api.schema.user.getCurrentUser;
  console.log("Current user: in serve component", currentUser);
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect to GitHub</CardTitle>
          <CardDescription>
            To get started, connect your GitHub account. This will allow Auto Blog to create and manage repositories for your blogs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href={authUrl}>
              <Github className="mr-2 h-4 w-4" />
              Connect Your Github Account
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
