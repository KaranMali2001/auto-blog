import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { Calendar, Edit, GitCommit, Loader2, RefreshCw, Trash2, User2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface CommitCardProps {
  commit: {
    _id: Id<"commits">;
    commitMessage: string;
    commitAuthor?: string;
    commitSha: string;
    summarizedCommitDiff?: string;
    _creationTime: number;
  };
  extractTags: (text: string) => string[];
  renderMarkdown: (text: string) => React.ReactElement[];
  onDelete: (commitId: Id<"commits">) => void;
  onUpdateSummary: (commitId: Id<"commits">, summary: string) => void;
}

export function CommitCard({ commit, extractTags, renderMarkdown, onDelete, onUpdateSummary }: CommitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const regenerateSummary = useMutation(api.schema.commit.regenerateSummary);
  const [editedContent, setEditedContent] = useState(commit.summarizedCommitDiff || "");
  const tags = extractTags(commit.summarizedCommitDiff || "");
  const date = new Date(commit._creationTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleSave = () => {
    onUpdateSummary(commit._id, editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(commit.summarizedCommitDiff || "");
    setIsEditing(false);
  };

  const handleRegenerate = async () => {
    if (!userInput.trim()) return;

    setIsRegenerating(true);
    toast.info("Regenerating summary...");

    try {
      await regenerateSummary({ commitId: commit._id, userInput });
      setIsRegenerateDialogOpen(false);
      setUserInput("");
      toast.success("Summary regenerated successfully!");
    } catch (error) {
      console.error("Failed to regenerate summary:", error);
      toast.error("Failed to regenerate summary. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="p-6 hover:bg-muted/30 transition-colors">
      <div className="space-y-4">
        {/* Commit Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h3 className="font-semibold text-lg leading-tight">{commit.commitMessage}</h3>
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
          <div className="flex items-center gap-2">
            {commit.summarizedCommitDiff && !isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Dialog open={isRegenerateDialogOpen} onOpenChange={setIsRegenerateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Regenerate Summary</DialogTitle>
                      <DialogDescription>
                        Provide instructions for how you'd like the AI to regenerate this commit summary.
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="E.g., 'Make it more detailed', 'Focus on the performance improvements', 'Use simpler language'..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsRegenerateDialogOpen(false)}
                        disabled={isRegenerating}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleRegenerate} disabled={!userInput.trim() || isRegenerating}>
                        {isRegenerating ? "Regenerating..." : "Regenerate"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete commit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this commit? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(commit._id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
        {isEditing ? (
          <RichTextEditor
            content={editedContent}
            onChange={setEditedContent}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : commit.summarizedCommitDiff ? (
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-primary hover:underline list-none flex items-center gap-2">
              <GitCommit className="h-4 w-4" />
              View commit summary
              {isRegenerating && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating...
                </span>
              )}
            </summary>
            <div className="mt-4 pl-6 border-l-2 border-border">
              <div className="prose prose-sm max-w-none text-sm">{renderMarkdown(commit.summarizedCommitDiff)}</div>
            </div>
          </details>
        ) : (
          <div className="text-sm text-muted-foreground italic flex items-center gap-2">
            <GitCommit className="h-4 w-4" />
            No summary available yet
          </div>
        )}
      </div>
    </div>
  );
}
