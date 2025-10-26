"use client";

import { ExternalLink, GitCommit, Sparkles } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Commit } from "@/types/index";

interface MasonryViewProps {
  commit: Commit;
  selected?: boolean;
  onSelect?: (commitId: string) => void;
  onClick?: () => void;
}

export function MasonryView({ commit, selected = false, onSelect, onClick }: MasonryViewProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Only open modal if not clicking checkbox
    if (!(e.target as HTMLElement).closest("[data-checkbox]")) {
      onClick?.();
    }
  };

  // Extract repository name from URL (e.g., "https://github.com/owner/repo" -> "owner/repo")
  const repoName = commit.commitRepositoryUrl.split("/").slice(-2).join("/");
  const shortSha = commit.commitSha?.slice(0, 7) || "unknown";
  const hasBeenUsed = commit.usedInBlogs && commit.usedInBlogs.length > 0;
  const hasSummary = !!commit.summarizedCommitDiff;

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-gradient-to-br transition-all duration-300",
        "cursor-pointer hover:shadow-xl hover:scale-[1.02]",
        selected ? "border-primary/60 from-primary/10 to-primary/5" : "border-border/50 from-card to-card/50 hover:border-primary/30",
        "overflow-hidden",
      )}
      onClick={handleCardClick}
    >
      {/* Selection Indicator */}
      {selected && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />}

      <div className="p-5 space-y-3 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div data-checkbox onClick={(e) => e.stopPropagation()}>
              <Checkbox checked={selected} onCheckedChange={() => onSelect?.(commit._id)} />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <GitCommit className="h-3 w-3 text-primary" />
              <span className="font-mono text-muted-foreground">{shortSha}</span>
            </div>
          </div>

          {hasBeenUsed && <div className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">Used</div>}
        </div>

        {/* Repo Name */}
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-xs font-semibold text-primary">{repoName}</span>
        </div>

        {/* Commit Message - Hero */}
        <div className="flex-1">
          <h3 className="text-sm font-medium leading-snug text-foreground line-clamp-2 min-h-[2.5rem]">{commit.commitMessage}</h3>
        </div>

        {/* Summary indicator */}
        {hasSummary && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <Sparkles className="h-3 w-3" />
            <span>Click to view AI summary</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{commit.commitAuthor}</span>
            <span>·</span>
            <span className="shrink-0">{formatRelativeTime(new Date(commit._creationTime))}</span>
          </div>

          <Link
            href={`${commit.commitRepositoryUrl}/commit/${commit.commitSha}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Decorative Element */}
      <div className={cn("absolute -right-8 -bottom-8 h-24 w-24 rounded-full opacity-10 transition-opacity", selected ? "bg-primary opacity-20" : "bg-muted group-hover:opacity-20")} />
    </div>
  );
}
