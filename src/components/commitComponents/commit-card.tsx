"use client";

import { ChevronDown, ChevronUp, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import type { Commit, Repository } from "@/types/index";

export interface CommitCardProps {
  commit: Commit;
  repository: Repository;
  selected?: boolean;
  onSelect?: (commitId: string) => void;
  variant?: "selectable" | "readonly" | "compact";
  showActions?: boolean;
}

export function CommitCard({ commit, repository, selected = false, onSelect, variant = "selectable", showActions = true }: CommitCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleCardClick = () => {
    if (variant === "selectable" && onSelect) {
      onSelect(commit._id);
    }
  };

  const shortSha = commit.commitSha?.slice(0, 7) || "unknown";
  const hasBeenUsed = commit.usedInBlogs && commit.usedInBlogs.length > 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card transition-all",
        variant === "selectable" && "cursor-pointer hover:border-primary/50 hover:shadow-md",
        selected && "border-primary bg-primary/5 ring-1 ring-primary/20",
        !selected && "border-border",
        variant === "compact" && "p-3",
        variant !== "compact" && "p-4",
      )}
      onClick={handleCardClick}
    >
      {/* Selection highlight gradient */}
      {selected && <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />}

      <div className="relative flex gap-3">
        {/* Checkbox (for selectable variant) */}
        {variant === "selectable" && (
          <div className="flex items-start pt-0.5">
            <Checkbox checked={selected} onCheckedChange={() => onSelect?.(commit._id)} onClick={(e) => e.stopPropagation()} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              {/* Commit SHA */}
              <Link
                href={`${repository.repoUrl}/commit/${commit.commitSha}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                {shortSha}
                <ExternalLink className="h-3 w-3" />
              </Link>

              {/* Commit Message */}
              <h4 className="font-semibold leading-snug text-card-foreground" title={commit.commitMessage}>
                {variant === "compact" ? truncate(commit.commitMessage, 50) : truncate(commit.commitMessage, 80)}
              </h4>

              {/* Author and Time */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{commit.commitAuthor}</span>
                <span>•</span>
                <span>{formatRelativeTime(new Date(commit._creationTime))}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-col gap-1">
              {hasBeenUsed && (
                <Badge variant="success" size="sm">
                  Used in {commit.usedInBlogs?.length} blog{commit.usedInBlogs?.length !== 1 && "s"}
                </Badge>
              )}
              {commit.summarizedCommitDiff && (
                <Badge variant="default" size="sm">
                  Summarized
                </Badge>
              )}
            </div>
          </div>

          {/* AI Summary (Collapsible) */}
          {commit.summarizedCommitDiff && variant !== "compact" && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Summary
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    View AI Summary
                  </>
                )}
              </button>

              {expanded && (
                <div className="animate-in fade-in slide-in-from-top-1 rounded-md border border-border bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground">
                  {expanded && commit.summarizedCommitDiff.length > 300 ? truncate(commit.summarizedCommitDiff, 300) : commit.summarizedCommitDiff}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {showActions && variant !== "compact" && (
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement regenerate summary
                  console.log("Regenerate summary for", commit._id);
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </Button>
              <a href={`${repository.repoUrl}/commit/${commit.commitSha}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View on GitHub
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
