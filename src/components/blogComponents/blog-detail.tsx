"use client";

import { useQueryWithStatus } from "@/app/Providers";
import { CommitCard } from "@/components/commitComponents/commit-card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useMutation } from "convex/react";
import { ArrowLeft, Check, Copy, Edit, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { FloatingSaveFooter } from "@/components/ui/floating-save-footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, formatPlatform, getWordCount } from "@/lib/utils";
import type { Repository } from "@/types/index";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
export interface BlogDetailPageProps {
  blogId: string;
}

export function BlogDetailPage({ blogId }: BlogDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams?.get("edit") === "true";

  const [isEditing, setIsEditing] = useState(editMode);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch blog from Convex
  const { data: blog, isPending: isBlogPending, error: blogError } = useQueryWithStatus(api.schema.blog.getBlogById, { blogId: blogId as Id<"blogs"> });
  const { data: commits, isPending: isCommitsPending, error: commitsError } = useQueryWithStatus(api.schema.commit.getRelatedCommits, { blogId: blogId as Id<"blogs"> });
  const { data: repos, isPending: isReposPending, error: reposError } = useQueryWithStatus(api.schema.repo.getRepos);

  // Mutations
  const updateBlog = useMutation(api.schema.blog.updateBlog);
  const deleteBlog = useMutation(api.schema.blog.deleteBlog);

  useEffect(() => {
    if (blog) {
      setEditedTitle(blog.title || "");
      setEditedContent(blog.content);
    }
  }, [blog]);

  // Get commits related to this blog
  const relatedCommits = useMemo(() => {
    if (!blog || !commits) return [];
    return commits.filter((commit) => blog.commitIds.includes(commit._id));
  }, [blog, commits]);

  // Get repositories for commits
  const commitRepos = useMemo(() => {
    if (!repos || !relatedCommits) return new Map();
    const repoMap = new Map<string, Repository>();
    relatedCommits.forEach((commit) => {
      const repo = repos.find((r) => r._id === commit.repoId);
      if (repo) {
        repoMap.set(commit._id, repo);
      }
    });
    return repoMap;
  }, [repos, relatedCommits]);

  // Handlers
  const handleCopy = async () => {
    if (!blog) return;
    try {
      await navigator.clipboard.writeText(blog.content);
      setCopied(true);
      toast.success("Blog copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy blog content:", error);
      toast.error("Failed to copy blog content");
    }
  };

  const handleSave = async () => {
    if (!blog) return;

    try {
      await updateBlog({
        blogId: blog._id,
        title: editedTitle,
        content: editedContent,
      });
      toast.success("Blog updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error("Failed to update blog");
    }
  };

  const handleCancel = () => {
    if (blog) {
      setEditedTitle(blog.title || "");
      setEditedContent(blog.content);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!blog) return;

    try {
      await deleteBlog({ blogId: blog._id });
      toast.success("Blog deleted successfully");
      router.push("/claude/blogs");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  // Loading state
  if (isBlogPending) {
    return <Spinner centered title="Loading blog post..." />;
  }
  if (isCommitsPending) {
    return <Spinner centered title="Loading commits..." />;
  }
  if (isReposPending) {
    return <Spinner centered title="Loading repositories..." />;
  }

  // Not found state
  if (blogError) {
    return <ErrorState title="Blog Not Found" message="The blog post you're looking for doesn't exist." />;
  }
  if (commitsError) {
    return <ErrorState title="Error Loading Commits" message="An unexpected error occurred. Please try again." />;
  }
  if (reposError) {
    return <ErrorState title="Error Loading Repositories" message="An unexpected error occurred. Please try again." />;
  }

  const platformIcon =
    blog.platform === "twitter" ? (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ) : (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
      </svg>
    );

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 pb-24">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Metadata Panel */}
      <div className="grid gap-6 rounded-lg border border-border bg-card p-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Platform</Label>
            <div className="mt-1 flex items-center gap-2">
              {platformIcon}
              <span className="font-medium">{formatPlatform(blog.platform)}</span>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Status</Label>
            <div className="mt-1">
              <Badge variant={blog.status === "completed" ? "success" : "warning"}>{blog.status}</Badge>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Auto-generated</Label>
            <div className="mt-1">
              <Badge variant={blog.autoGenerated ? "default" : "outline"}>{blog.autoGenerated ? "Yes" : "No"}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Created</Label>
            <p className="mt-1 text-sm font-medium">{formatDateTime(blog._creationTime)}</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Word Count</Label>
            <p className="mt-1 text-sm font-medium">{getWordCount(blog.content)} words</p>
          </div>

          {blog.options?.toneType && (
            <div>
              <Label className="text-xs text-muted-foreground">Tone</Label>
              <p className="mt-1 text-sm font-medium capitalize">{blog.options.toneType}</p>
            </div>
          )}

          {blog.options?.length && (
            <div>
              <Label className="text-xs text-muted-foreground">Length</Label>
              <p className="mt-1 text-sm font-medium capitalize">{blog.options.length}</p>
            </div>
          )}

          {blog.totalGenerations && blog.totalGenerations > 1 && (
            <div>
              <Label className="text-xs text-muted-foreground">Generated</Label>
              <p className="mt-1 text-sm font-medium">{blog.totalGenerations} times</p>
            </div>
          )}
        </div>
      </div>

      {/* Blog Content Section */}
      <div className="rounded-lg border border-border bg-card p-8">
        {isEditing ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} placeholder="Blog title" className="mt-2 text-xl font-bold" />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="mt-2 min-h-[500px] font-mono text-sm" />
              <p className="mt-2 text-xs text-muted-foreground">{getWordCount(editedContent)} words</p>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <h1 className="mb-6 text-3xl font-bold text-card-foreground">{blog.title || "Untitled"}</h1>
            <div className="whitespace-pre-wrap text-card-foreground leading-relaxed">{blog.content}</div>
          </div>
        )}
      </div>

      {/* Related Commits Section */}
      {relatedCommits.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-card-foreground">Related Commits</h2>
            <Badge variant="outline">
              {relatedCommits.length} commit{relatedCommits.length !== 1 && "s"}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {relatedCommits.map((commit) => {
              const repo = commitRepos.get(commit._id);
              if (!repo) return null;

              return <CommitCard key={commit._id} commit={commit} repository={repo} variant="compact" showActions={false} />;
            })}
          </div>
        </div>
      )}

      {/* Floating Action Bar for Edit Mode */}
      <FloatingSaveFooter isVisible={isEditing} icon={Edit} indicatorText="Editing blog post" onCancel={handleCancel} onSave={handleSave} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post
              {blog.title && ` "${blog.title}"`} and remove it from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
