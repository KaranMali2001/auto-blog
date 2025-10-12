"use client";

import { useQueryWithStatus } from "@/app/Providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { ArrowLeft, Calendar, Edit, FileText, Loader2, RefreshCw, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params.id as Id<"blogs">;
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  
  const { data: blog, isPending, error } = useQueryWithStatus(api.schema.blog.getBlogById, { blogId });
  const { data: commits, isPending: commitsPending } = useQueryWithStatus(api.schema.commit.getCommitsByIds, { 
    commitIds: blog?.commitIds || [] 
  });
  const deleteBlog = useMutation(api.schema.blog.deleteBlog);
  const updateBlog = useMutation(api.schema.blog.updateBlog);

  const handleDelete = async () => {
    try {
      await deleteBlog({ blogId });
      toast.success("Blog deleted successfully");
      router.push("/blog");
    } catch (error) {
      console.error("Failed to delete blog:", error);
      toast.error("Failed to delete blog. Please try again.");
    }
  };

  const handleEdit = () => {
    if (blog) {
      setEditedTitle(blog.title);
      setEditedContent(blog.content);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateBlog({
        blogId,
        title: editedTitle,
        content: editedContent,
      });
      toast.success("Blog updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update blog:", error);
      toast.error("Failed to update blog. Please try again.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle("");
    setEditedContent("");
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <p>Blog not found or you don't have permission to view it.</p>
              <Button 
                onClick={() => router.push("/blog")} 
                variant="outline" 
                className="mt-4"
              >
                Back to Blogs
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push("/blog")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={blog.status === "completed" ? "default" : "secondary"} className="px-3 py-1">
              {blog.status}
            </Badge>
            {blog.status === "completed" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEdit}
                className="h-8"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="h-8"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Blog Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Blog Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <CardTitle className="text-3xl font-bold">{blog.title}</CardTitle>
                  )}
                  <CardDescription className="mt-2 text-lg">
                    {blog.platform === "twitter" ? "Twitter/X" : "LinkedIn"} • {blog.commitIds.length} commit{blog.commitIds.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                {blog.updatedAt !== blog.createdAt && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Updated {new Date(blog.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {blog.options && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {blog.options.toneType && (
                    <Badge variant="outline">
                      Tone: {blog.options.toneType}
                    </Badge>
                  )}
                  <Badge variant="outline">
                    Length: {blog.options.length}
                  </Badge>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Blog Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Blog Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {blog.status === "pending" ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium">Generating your blog post...</p>
                  <p className="text-muted-foreground">This may take a few moments. The page will update automatically when ready.</p>
                </div>
              ) : isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="mt-1 min-h-[300px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : blog.content ? (
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap">{blog.content}</div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No content available</p>
                  <p className="text-muted-foreground">The blog content could not be generated.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Commits */}
          <Card>
            <CardHeader>
              <CardTitle>Related Commits</CardTitle>
              <CardDescription>
                This blog post was generated from {blog.commitIds.length} commit{blog.commitIds.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commitsPending ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    <p>Loading commit details...</p>
                  </div>
                ) : commits && commits.length > 0 ? (
                  commits.map((commit, index) => (
                    <div key={commit._id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="w-6 text-center text-muted-foreground mt-0.5">{index + 1}.</span>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-foreground">{commit.commitMessage}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {commit.commitAuthor && <span>by {commit.commitAuthor}</span>}
                          <span className="font-mono text-xs">{commit.commitSha.substring(0, 7)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No commit details available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
