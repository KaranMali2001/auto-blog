"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitBranch, GitCommit, ExternalLink } from "lucide-react";
import { CommitCard } from "@/components/dashboard/commit-card";
import { extractTags, renderMarkdown } from "@/components/dashboard/markdown-renderer";

export default function DashboardPage() {
  const commits = useQuery(api.schema.commit.getCommits);
  const repos = useQuery(api.schema.repo.getRepos);

  if (commits === undefined || repos === undefined) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <DashboardHeader />

        {repos.length === 0 && commits.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {/* Repositories Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <GitBranch className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Repositories</h2>
              </div>
              {repos.length === 0 ? (
                <Card className="p-8">
                  <div className="text-center text-muted-foreground">
                    <p>No repositories connected</p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {repos.map((repo) => (
                    <Card key={repo._id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <GitBranch className="h-5 w-5 text-primary" />
                          {repo.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a
                            href={repo.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Repository
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Commits Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <GitCommit className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Recent Commits</h2>
              </div>
              {commits.length === 0 ? (
                <Card className="p-8">
                  <div className="text-center text-muted-foreground">
                    <p>No commits yet</p>
                  </div>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {commits.map((commit) => (
                        <CommitCard
                          key={commit._id}
                          commit={commit}
                          extractTags={extractTags}
                          renderMarkdown={renderMarkdown}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
