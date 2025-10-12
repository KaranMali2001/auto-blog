"use client";

import { useQueryWithStatus } from "@/app/Providers";
import { BlogGenerationForm } from "@/components/dashboard/blog-generation-form";
import { CommitCard } from "@/components/dashboard/commit-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingState } from "@/components/dashboard/loading-state";
import { extractTags, renderMarkdown } from "@/components/dashboard/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "convex/react";
import { ExternalLink, FileText, GitBranch } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function DashboardPage() {
  const { data: commits, isPending: commitsPending } = useQueryWithStatus(api.schema.commit.getCommits);
  const deleteCommit = useMutation(api.schema.commit.deleteCommit);
  const updateSummary = useMutation(api.schema.commit.updateSummary);
  const router = useRouter();
  
  const [selectedCommits, setSelectedCommits] = useState<Id<"commits">[]>([]);
  const [showBlogForm, setShowBlogForm] = useState(false);

  if (commitsPending || !commits) {
    return <LoadingState />;
  }

  // Group commits by repository URL (since commits have the URL)
  const commitsByRepo = commits.reduce((acc, commit) => {
    const repoUrl = commit.commitRepositoryUrl;
    const repoName = repoUrl.split('/').slice(-2).join('/'); // Get owner/repo from URL
    
    if (!acc[repoUrl]) {
      acc[repoUrl] = {
        repo: { name: repoName, repoUrl },
        commits: []
      };
    }
    acc[repoUrl].commits.push(commit);
    return acc;
  }, {} as Record<string, { repo: any; commits: any[] }>);

  const handleCommitSelection = (commitId: Id<"commits">, checked: boolean) => {
    if (checked) {
      setSelectedCommits(prev => [...prev, commitId]);
    } else {
      setSelectedCommits(prev => prev.filter(id => id !== commitId));
    }
  };

  const handleSelectAll = (repoCommits: any[], checked: boolean) => {
    if (checked) {
      const newSelections = repoCommits.map(c => c._id).filter(id => !selectedCommits.includes(id));
      setSelectedCommits(prev => [...prev, ...newSelections]);
    } else {
      const repoCommitIds = repoCommits.map(c => c._id);
      setSelectedCommits(prev => prev.filter(id => !repoCommitIds.includes(id)));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <DashboardHeader />
        <div className="flex gap-4">
          <Button onClick={() => router.push("/dashboard/integrations")}>Go TO Integrations</Button>
          {selectedCommits.length > 0 && (
            <Button onClick={() => setShowBlogForm(true)} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Generate Blog ({selectedCommits.length} commits)
            </Button>
          )}
        </div>
        
        {commits.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {/* Commits grouped by Repository */}
            {Object.values(commitsByRepo).map(({ repo, commits: repoCommits }) => {
              const allSelected = repoCommits.every(c => selectedCommits.includes(c._id));
              const someSelected = repoCommits.some(c => selectedCommits.includes(c._id));
              
              return (
                <section key={repo.repoUrl}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <GitBranch className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold">{repo.name}</h2>
                      <Badge variant="secondary">{repoCommits.length} commits</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`select-all-${repo.repoUrl.replace(/[^a-zA-Z0-9]/g, '-')}`}
                          checked={allSelected}
                          ref={(el) => {
                            if (el && 'indeterminate' in el) {
                              (el as any).indeterminate = someSelected && !allSelected;
                            }
                          }}
                          onCheckedChange={(checked) => handleSelectAll(repoCommits, checked as boolean)}
                        />
                        <label htmlFor={`select-all-${repo.repoUrl.replace(/[^a-zA-Z0-9]/g, '-')}`} className="text-sm font-medium">
                          Select All
                        </label>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={repo.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          View Repository
                        </a>
                      </Button>
                    </div>
                  </div>
                  
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {repoCommits.map((commit) => (
                          <div key={commit._id} className="flex items-start gap-4 p-6 hover:bg-muted/30 transition-colors">
                            <Checkbox
                              id={`commit-${commit._id}`}
                              checked={selectedCommits.includes(commit._id)}
                              onCheckedChange={(checked) => handleCommitSelection(commit._id, checked as boolean)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <CommitCard
                                commit={commit}
                                extractTags={extractTags}
                                renderMarkdown={renderMarkdown}
                                onDelete={(commitId) => deleteCommit({ commitId })}
                                onUpdateSummary={(commitId, summarizedCommitDiff) => updateSummary({ commitId, summarizedCommitDiff })}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              );
            })}
          </div>
        )}
        
        {/* Blog Generation Form Modal */}
        {showBlogForm && (
          <BlogGenerationForm
            selectedCommits={selectedCommits}
            commitData={commits.map(commit => ({
              id: commit._id,
              message: commit.commitMessage,
              author: commit.commitAuthor,
              sha: commit.commitSha
            }))}
            onClose={() => {
              setShowBlogForm(false);
              setSelectedCommits([]);
            }}
            onSuccess={(blogId) => {
              setShowBlogForm(false);
              setSelectedCommits([]);
              router.push(`/blog/${blogId}`);
            }}
          />
        )}
      </div>
    </div>
  );
}
