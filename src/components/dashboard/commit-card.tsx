import { Badge } from "@/components/ui/badge";
import { Calendar, GitCommit, User2 } from "lucide-react";
import React from "react";

interface CommitCardProps {
  commit: {
    _id: string;
    commitMessage: string;
    commitAuthor?: string;
    commitSha: string;
    summarizedCommitDiff?: string;
    _creationTime: number;
  };
  extractTags: (text: string) => string[];
  renderMarkdown: (text: string) => React.ReactElement[];
}

export function CommitCard({ commit, extractTags, renderMarkdown }: CommitCardProps) {
  const tags = extractTags(commit.summarizedCommitDiff || "");
  const date = new Date(commit._creationTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-6 hover:bg-muted/30 transition-colors">
      <div className="space-y-4">
        {/* Commit Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h3 className="font-semibold text-lg leading-tight">
              {commit.commitMessage}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {commit.commitAuthor && (
                <span className="flex items-center gap-1.5">
                  <User2 className="h-4 w-4" />
                  {commit.commitAuthor}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {date}
              </span>
              <Badge variant="outline" className="font-mono">
                {commit.commitSha.substring(0, 7)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 6).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Summary */}
        {commit.summarizedCommitDiff && (
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-primary hover:underline list-none flex items-center gap-2">
              <GitCommit className="h-4 w-4" />
              View commit summary
            </summary>
            <div className="mt-4 pl-6 border-l-2 border-border">
              <div className="prose prose-sm max-w-none text-sm">
                {renderMarkdown(commit.summarizedCommitDiff)}
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
