"use client";

import { CommitCard } from "@/components/commitComponents/commit-card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Commit, Repository } from "@/types/index";
import { ChevronDown, ChevronRight, FolderGit2 } from "lucide-react";
import * as React from "react";

export interface RepositorySectionProps {
  repository: Repository;
  commits: Commit[];
  selectedCommits: Set<string>;
  onSelectCommit: (commitId: string) => void;
  onSelectAll: (repoId: string, commitIds: string[]) => void;
}

export function RepositorySection({ repository, commits, selectedCommits, onSelectCommit, onSelectAll }: RepositorySectionProps) {
  const [expanded, setExpanded] = React.useState(true);

  const commitIds = commits.map((c) => c._id);
  const selectedCount = commitIds.filter((id) => selectedCommits.has(id)).length;
  const allSelected = selectedCount === commits.length && commits.length > 0;
  const someSelected = selectedCount > 0 && selectedCount < commits.length;

  const handleSelectAll = () => {
    onSelectAll(repository._id, commitIds);
  };

  return (
    <div className="space-y-3">
      {/* Repository Header */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        {/* Expand/Collapse Button */}
        <button type="button" onClick={() => setExpanded(!expanded)} className="flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground">
          {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>

        {/* Select All Checkbox */}
        <Checkbox checked={allSelected} data-state={someSelected ? "indeterminate" : undefined} onCheckedChange={handleSelectAll} />

        {/* Repository Icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FolderGit2 className="h-5 w-5" />
        </div>

        {/* Repository Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-card-foreground">{repository.name}</h3>
            <Badge variant="outline" size="sm">
              {commits.length} commit{commits.length !== 1 && "s"}
            </Badge>
            {selectedCount > 0 && (
              <Badge variant="default" size="sm">
                {selectedCount} selected
              </Badge>
            )}
          </div>
          <a href={repository.repoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-primary">
            {repository.repoUrl}
          </a>
        </div>
      </div>

      {/* Commits Grid */}
      {expanded && commits.length > 0 && (
        <div className="grid gap-3 pl-4 md:grid-cols-2 lg:grid-cols-3">
          {commits.map((commit) => (
            <CommitCard key={commit._id} commit={commit} repository={repository} selected={selectedCommits.has(commit._id)} onSelect={onSelectCommit} variant="selectable" showActions={true} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {expanded && commits.length === 0 && (
        <div className="ml-4 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">No commits found for this repository</p>
        </div>
      )}
    </div>
  );
}
