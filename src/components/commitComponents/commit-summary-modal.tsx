"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/utils";
import type { Commit } from "@/types/index";
import { useMutation } from "convex/react";
import { Calendar, ExternalLink, FileCode, FolderGit2, RefreshCw, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

interface CommitSummaryModalProps {
  commit: Commit | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CommitSummaryModal({ commit, isOpen, onClose }: CommitSummaryModalProps) {
  const [userInput, setUserInput] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const regenerateSummary = useMutation(api.schema.commit.regenerateSummary);

  if (!commit) return null;

  const repoName = commit.commitRepositoryUrl.split("/").slice(-2).join("/");

  const shortSha = commit.commitSha?.slice(0, 7) || "unknown";
  const hasBeenUsed = commit.usedInBlogs && commit.usedInBlogs.length > 0;

  const handleRegenerate = async () => {
    if (!userInput.trim()) {
      toast.error("Please provide instructions for regeneration");
      return;
    }

    try {
      setIsRegenerating(true);
      await regenerateSummary({
        commitId: commit._id,
        userInput: userInput.trim(),
      });
      toast.success("Regenerating summary... This may take a moment.");
      setUserInput("");
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to regenerate summary:", error);
      toast.error("Failed to regenerate summary. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-6xl max-h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header Section - Compact */}
        <DialogHeader className="bg-muted/30 px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="sr-only">Commit Details</DialogTitle>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-sm mb-3">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-primary font-medium">
              <FolderGit2 className="h-3.5 w-3.5" />
              {repoName}
            </div>
            <Link
              href={`${commit.commitRepositoryUrl}/commit/${commit.commitSha}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <FileCode className="h-3.5 w-3.5" />
              {shortSha}
            </Link>
            <div className="inline-flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{commit.commitAuthor}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatRelativeTime(new Date(commit._creationTime))}</span>
            </div>
            {hasBeenUsed && (
              <div className="inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300 ml-auto">
                Used in {commit.usedInBlogs?.length} blog{commit.usedInBlogs?.length !== 1 && "s"}
              </div>
            )}
          </div>

          {/* Commit Message - Scrollable with max height */}
          <div className="max-h-24 overflow-y-auto rounded-md bg-muted/50 px-3 py-2 border border-border/50">
            <p className="text-sm font-medium leading-relaxed text-foreground">{commit.commitMessage}</p>
          </div>
        </DialogHeader>

        {/* AI Summary Section - Gets most space */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {commit.summarizedCommitDiff ? (
            <div className="relative">
              {/* Section Header - Sticky */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-6 pt-6 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">AI Generated Summary</h3>
                </div>
              </div>

              {/* Summary Content */}
              <div className="p-6 space-y-6">
                <div className="rounded-lg bg-muted/30 p-5 border border-border/50">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{commit.summarizedCommitDiff}</div>
                  </div>
                </div>

                {/* Regenerate Section */}
                <div className="rounded-lg bg-card border border-border p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold text-foreground">Regenerate Summary</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Provide specific instructions to improve or modify the summary</p>
                  <Textarea
                    placeholder="E.g., Make it more technical, focus on the security implications, add more code examples..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="min-h-[80px] text-sm"
                    disabled={isRegenerating}
                  />
                  <Button onClick={handleRegenerate} disabled={isRegenerating || !userInput.trim()} size="sm" className="w-full">
                    {isRegenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate Summary
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="rounded-full bg-muted/50 p-4 mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">No AI Summary Available</h3>
              <p className="text-sm text-muted-foreground max-w-sm">This commit hasn't been analyzed yet. The summary will appear here once it's generated.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex-row items-center justify-between gap-3 border-t border-border bg-muted/20 px-6 py-4 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Link href={`${commit.commitRepositoryUrl}/commit/${commit.commitSha}`} target="_blank" rel="noopener noreferrer">
            <Button className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View on GitHub
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
