"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types";
import { useMutation } from "convex/react";
import { FileText, Linkedin, Loader2, Save, Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";

export function PromptSettings({ user }: { user: User }) {
  // const { data: user, isPending, isError } = useQueryWithStatus(api.schema.user.getCurrentUser);
  const updateCustomPrompts = useMutation(api.schema.user.updateCustomPrompts);

  const [customCommitPrompt, setCustomCommitPrompt] = useState("");
  const [customTwitterPrompt, setCustomTwitterPrompt] = useState("");
  const [customLinkedInPrompt, setCustomLinkedInPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form with user data when available
  useEffect(() => {
    if (user && !isInitialized) {
      setCustomCommitPrompt(user.customCommitPrompt || "");
      setCustomTwitterPrompt(user.customTwitterPrompt || "");
      setCustomLinkedInPrompt(user.customLinkedInPrompt || "");
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCustomPrompts({
        customCommitPrompt: customCommitPrompt.trim() || undefined,
        customTwitterPrompt: customTwitterPrompt.trim() || undefined,
        customLinkedInPrompt: customLinkedInPrompt.trim() || undefined,
      });
      toast.success("Custom prompts saved successfully!");
    } catch (error: any) {
      console.error("Failed to save prompts:", error);
      toast.error(error?.message || "Failed to save custom prompts");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = (type: "commit" | "twitter" | "linkedin") => {
    if (type === "commit") {
      setCustomCommitPrompt("");
    } else if (type === "twitter") {
      setCustomTwitterPrompt("");
    } else {
      setCustomLinkedInPrompt("");
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-card-foreground">Custom Prompts</h2>
        <p className="text-sm text-muted-foreground">Customize the prompts used for generating commit summaries and blog posts. Leave empty to use default prompts.</p>
      </div>

      {/* Commit Prompt */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Custom Commit Prompt</CardTitle>
                <CardDescription>
                  Prompt used for generating commit summaries. Supports placeholders: {"{commitMessage}"}, {"{filesChanged}"}, {"{additions}"}, {"{deletions}"}, {"{filteredDiff}"}
                </CardDescription>
              </div>
            </div>
            {customCommitPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleReset("commit");
                }}
              >
                Reset to Default
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="commit-prompt">Commit Summary Prompt</Label>
            <Textarea
              id="commit-prompt"
              value={customCommitPrompt}
              onChange={(e) => {
                setCustomCommitPrompt(e.target.value);
              }}
              placeholder="Enter your custom commit prompt here..."
              className="min-h-32 font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Twitter Prompt */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Twitter className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Custom Twitter Prompt</CardTitle>
                <CardDescription>
                  Prompt used for generating Twitter posts. Supports placeholders: {"{lengthGuidelines}"}, {"{toneGuidelines}"}, {"{commitSummaries}"}, {"{toneType}"}, {"{length}"}
                </CardDescription>
              </div>
            </div>
            {customTwitterPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleReset("twitter");
                }}
              >
                Reset to Default
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="twitter-prompt">Twitter Post Prompt</Label>
            <Textarea
              id="twitter-prompt"
              value={customTwitterPrompt}
              onChange={(e) => {
                setCustomTwitterPrompt(e.target.value);
              }}
              placeholder="Enter your custom Twitter prompt here..."
              className="min-h-32 font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn Prompt */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Linkedin className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Custom LinkedIn Prompt</CardTitle>
                <CardDescription>
                  Prompt used for generating LinkedIn posts. Supports placeholders: {"{lengthGuidelines}"}, {"{toneGuidelines}"}, {"{commitSummaries}"}, {"{toneType}"}, {"{length}"}
                </CardDescription>
              </div>
            </div>
            {customLinkedInPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleReset("linkedin");
                }}
              >
                Reset to Default
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="linkedin-prompt">LinkedIn Post Prompt</Label>
            <Textarea
              id="linkedin-prompt"
              value={customLinkedInPrompt}
              onChange={(e) => {
                setCustomLinkedInPrompt(e.target.value);
              }}
              placeholder="Enter your custom LinkedIn prompt here..."
              className="min-h-32 font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
