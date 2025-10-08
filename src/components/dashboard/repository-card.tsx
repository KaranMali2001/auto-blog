import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, GitBranch } from "lucide-react";
import React from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { CommitCard } from "./commit-card";

interface Commit {
  _id: Id<"commits">;
  commitMessage: string;
  commitAuthor?: string;
  commitSha: string;
  repoId: string;
  summarizedCommitDiff?: string;
  _creationTime: number;
  repo: {
    name: string;
    repoUrl: string;
  } | null;
}

interface RepositoryCardProps {
  repoUrl: string;
  repoName: string;
  commits: Commit[];
  extractTags: (text: string) => string[];
  renderMarkdown: (text: string) => React.ReactElement[];
}

export function RepositoryCard({ repoUrl, repoName, commits, extractTags, renderMarkdown }: RepositoryCardProps) {
  return (
    <Card>
      <CardHeader className="border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitBranch className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-xl">{repoName}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {commits.length} commit{commits.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View Repo
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {commits.map((commit) => (
            <CommitCard
              key={commit._id}
              commit={{
                _id: commit._id,
                commitMessage: commit.commitMessage,
                commitAuthor: commit.commitAuthor,
                commitSha: commit.commitSha,
                summarizedCommitDiff: commit.summarizedCommitDiff,
                _creationTime: commit._creationTime,
              }}
              extractTags={extractTags}
              renderMarkdown={renderMarkdown}
              onDelete={() => {}}
              onUpdateSummary={() => Promise.resolve()}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
