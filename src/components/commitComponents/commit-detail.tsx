"use client";

import { useQueryWithStatus } from "@/app/Providers";
import { PageHeader } from "@/components/layoutComponents/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/utils";
import { useMutation } from "convex/react";
import { Calendar, ExternalLink, FileCode, FolderGit2, RefreshCw, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface CommitDetailPageProps {
  commitId: string;
}

export function CommitDetailPage({ commitId }: CommitDetailPageProps) {
  const [userInput, setUserInput] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const {
    data: commit,
    isPending,
    error,
  } = useQueryWithStatus(api.schema.commit.getCommitById, {
    commitId: commitId as Id<"commits">,
  });
  const regenerateSummary = useMutation(api.schema.commit.regenerateSummary);

  const handleRegenerate = async () => {
    if (!userInput.trim()) {
      toast.error("Please provide instructions for regeneration");
      return;
    }

    if (!commit) return;

    try {
      setIsRegenerating(true);
      await regenerateSummary({
        commitId: commit._id,
        userInput: userInput.trim(),
      });
      toast.success("Regenerating summary... This may take a moment.");
      setUserInput("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to regenerate summary:", error);
      toast.error("Failed to regenerate summary. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isPending) {
    return <Spinner centered title="Loading commit details..." />;
  }

  if (error || !commit) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorState
          title="Error Loading Commit"
          message={error?.message || "Commit not found. Please try again."}
          action={{
            label: "Back to Dashboard",
            onClick: () => router.push("/dashboard"),
          }}
        />
      </div>
    );
  }

  const repoName = commit.commitRepositoryUrl.split("/").slice(-2).join("/");
  const shortSha = commit.commitSha?.slice(0, 7) || "unknown";

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
      {/* Header */}
      <PageHeader title="Commit Details" description="View and regenerate AI-generated commit summary" />

      {/* Commit Info Card */}
      <Card className="bg-card">
        <CardContent className="px-3 py-0">
          <div className="space-y-2">
            {/* Meta Info */}
            <div className="flex items-center justify-between gap-3 text-sm flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-primary font-medium">
                  <FolderGit2 className="h-3.5 w-3.5" />
                  {repoName}
                </div>
                <Link
                  href={`${commit.commitRepositoryUrl}/commit/${commit.commitSha}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-muted-foreground hover:text-primary transition-colors"
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
              </div>

              {/* Regenerate Button - Inline */}
              {commit.summarizedCommitDiff && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Regenerate Summary
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Regenerate Summary</DialogTitle>
                      <DialogDescription>Provide specific instructions to improve or modify the AI-generated summary.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Textarea
                        placeholder="E.g., Make it more technical, focus on the security implications, add more code examples..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        className="min-h-[120px]"
                        disabled={isRegenerating}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isRegenerating}>
                        Cancel
                      </Button>
                      <Button onClick={handleRegenerate} disabled={isRegenerating || !userInput.trim()}>
                        {isRegenerating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Regenerate
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Commit Message in Box */}
            <div className="rounded-md bg-background px-3 py-2 border border-border">
              <p className="text-sm leading-relaxed text-foreground">{commit.commitMessage}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Summary Card */}
      <Card>
        <CardContent className="px-3 py-0">
          {commit.summarizedCommitDiff ? (
            <div className="space-y-2">
              {/* AI Summary Header */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                </div>
                <h3 className="text-base font-semibold text-foreground">AI Generated Summary</h3>
              </div>

              {/* Summary Content */}
              <div className="rounded-lg bg-muted/30 p-3 border border-border/50">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{commit.summarizedCommitDiff}</div>
                </div>
              </div>

              {/* GitHub Link */}
              <div className="flex justify-end">
                <Link href={`${commit.commitRepositoryUrl}/commit/${commit.commitSha}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View on GitHub
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Sparkles className="h-10 w-10" />}
              title="No AI Summary Available"
              description="This commit hasn't been analyzed yet. The summary will appear here once it's generated."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
