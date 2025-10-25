import { useQueryWithStatus } from "@/app/Providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, FolderGit2, Github } from "lucide-react";

import { User } from "@/types/index";
import { api } from "../../../convex/_generated/api";
export function GitHubSection({ user }: { user: User }) {
  const isConnected = user?.installationId;

  const { data: repos, error: reposError, isPending: isReposPending } = useQueryWithStatus(api.schema.repo.getRepos);
  if (reposError) {
    return <ErrorState icon={<FolderGit2 />} title={"An Error occured while loading repositories"} />;
  }
  if (isReposPending) {
    return <Spinner centered title="Loading GitHub repositories..." />;
  }
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
              <Button variant="outline" size="sm">
                Update Connection
              </Button>
              <Button variant="destructive" size="sm">
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Github className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold text-card-foreground">Connect your GitHub account</h3>
            <p className="mb-6 text-sm text-muted-foreground">Analyze commits and generate blog posts automatically</p>
            <Button variant="primary">
              <Github className="h-4 w-4" />
              Connect GitHub
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
