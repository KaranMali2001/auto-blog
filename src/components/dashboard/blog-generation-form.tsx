"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "convex/react";
import { FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface BlogGenerationFormProps {
  selectedCommits: Id<"commits">[];
  commitData: Array<{
    id: Id<"commits">;
    message: string;
    author?: string;
    sha: string;
  }>;
  onClose: () => void;
  onSuccess: (blogId: Id<"blogs">) => void;
}

export function BlogGenerationForm({ selectedCommits, commitData, onClose, onSuccess }: BlogGenerationFormProps) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<"twitter" | "linkedin">("twitter");
  const [toneType, setToneType] = useState<"technical" | "business" | "hiring manager" | "professional">(
    "professional",
  );
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [isGenerating, setIsGenerating] = useState(false);

  const createBlog = useMutation(api.schema.blog.createBlog);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCommits.length === 0) {
      toast.error("Please select at least one commit");
      return;
    }

    setIsGenerating(true);

    try {
      const options = {
        toneType: toneType,
        length,
      };

      const blogId = await createBlog({
        title: title || undefined,
        commitIds: selectedCommits,
        platform,
        options,
      });

      toast.success("Blog generation started! Redirecting to blog page...");
      onSuccess(blogId);
    } catch (error) {
      console.error("Failed to create blog:", error);
      toast.error("Failed to create blog. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Blog Post
          </DialogTitle>
          <DialogDescription>
            Create a blog post from {selectedCommits.length} selected commit{selectedCommits.length !== 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a custom title for your blog post"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={(value: "twitter" | "linkedin") => setPlatform(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tone">Tone Type</Label>
              <Select
                value={toneType}
                onValueChange={(value: "technical" | "business" | "hiring manager" | "professional") =>
                  setToneType(value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select tone type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional (Default)</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="hiring manager">Hiring Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="length">Length</Label>
              <Select value={length} onValueChange={(value: "short" | "medium" | "long") => setLength(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Commits</CardTitle>
              <CardDescription>
                {selectedCommits.length} commit{selectedCommits.length !== 1 ? "s" : ""} will be used to generate your
                blog post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedCommits.map((commitId, index) => {
                  const commit = commitData.find((c) => c.id === commitId);
                  return (
                    <div key={commitId} className="flex items-start gap-3 text-sm">
                      <span className="w-6 text-center text-muted-foreground mt-0.5">{index + 1}.</span>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-foreground">{commit?.message || "Unknown commit"}</div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {commit?.author && <span>by {commit.author}</span>}
                          {commit?.sha && <span className="font-mono text-xs">{commit.sha.substring(0, 7)}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Blog Post"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
