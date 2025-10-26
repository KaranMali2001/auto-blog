import { useQueryWithStatus } from "@/app/Providers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Spinner } from "@/components/ui/spinner";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, ExternalLink, FolderGit2, Github, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { User } from "@/types/index";
import { api } from "../../../convex/_generated/api";
export function GitHubSection({ user }: { user: User }) {
  const isConnected = user?.installationId;
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const { data: repos, error: reposError, isPending: isReposPending } = useQueryWithStatus(api.schema.repo.getRepos);
  const installationUrl = useQuery(api.schema.user.getInstallationUrl);
  const disconnectGitHub = useMutation(api.schema.user.disconnectGitHub);
  if (reposError) {
    return <ErrorState icon={<FolderGit2 />} title={"An Error occured while loading repositories"} />;
  }
  if (isReposPending) {
    return <Spinner centered title="Loading GitHub repositories..." />;
  }

  const handleConnectGitHub = async () => {
    if (!installationUrl) {
      toast.error("Failed to get GitHub installation URL");
      return;
    }

    setIsConnecting(true);
    try {
      // Redirect to GitHub OAuth
      window.location.href = installationUrl;
    } catch (error) {
      console.error("Failed to connect GitHub:", error);
      toast.error("Failed to initiate GitHub connection");
      setIsConnecting(false);
    }
  };

  const handleUpdateConnection = async () => {
    if (!installationUrl) {
      toast.error("Failed to get GitHub installation URL");
      return;
    }

    setIsConnecting(true);
    try {
      // Open GitHub settings for this app installation
      window.location.href = installationUrl;
    } catch (error) {
      console.error("Failed to update connection:", error);
      toast.error("Failed to open GitHub settings");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectGitHub();
      toast.success("GitHub disconnected successfully!");

      // Open GitHub installations page in new window
      window.open("https://github.com/settings/installations", "_blank");

      // Show additional info
      toast.info("Please uninstall the app from your GitHub settings to complete the disconnection.");

      // Refresh after a delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error: any) {
      console.error("Failed to disconnect:", error);
      toast.error(error?.message || "Failed to disconnect GitHub");
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Connection Status Card */}
      <div className="rounded-lg border border-border bg-card p-6">
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">GitHub App Connected</h3>
                  <p className="text-sm text-muted-foreground">Installation ID: {user.installationId}</p>
                </div>
              </div>
              <Badge variant={"success"}>Connected</Badge>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleUpdateConnection} disabled={isConnecting || isDisconnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Update Connection"
                )}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isConnecting || isDisconnecting}>
                    {isDisconnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      "Disconnect"
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect GitHub?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-3">
                        <div>Are you sure you want to disconnect your GitHub account? This will:</div>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Remove the GitHub connection from your account</li>
                          <li>Stop syncing new commits automatically</li>
                          <li>Keep all your existing data (repos, commits, blogs)</li>
                        </ul>
                        <div className="text-xs text-muted-foreground mt-3">You'll be redirected to GitHub to complete the uninstallation.</div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDisconnect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      <ExternalLink className="h-4 w-4" />
                      Disconnect & Uninstall
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Github className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold text-card-foreground">Connect your GitHub account</h3>
            <p className="mb-6 text-sm text-muted-foreground">Analyze commits and generate blog posts automatically</p>
            <Button variant="primary" onClick={handleConnectGitHub} disabled={isConnecting || !installationUrl}>
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="h-4 w-4" />
                  Connect GitHub
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Connected Repositories */}
      {isConnected && repos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-card-foreground">Connected Repositories</h2>
          <div className="space-y-3">
            {repos.map((repo) => (
              <div key={repo._id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FolderGit2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-card-foreground">{repo.name}</h4>
                    <a href={repo.repoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {repo.repoUrl}
                    </a>
                  </div>
                </div>
                {/* <Badge variant="outline">{repo.} commits</Badge> */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
