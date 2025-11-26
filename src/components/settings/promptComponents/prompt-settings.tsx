"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FloatingSaveFooter } from "@/components/ui/floating-save-footer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types";
import { useMutation } from "convex/react";
import { FileText, Linkedin, Save, Twitter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const [initialValues, setInitialValues] = useState({
    customCommitPrompt: "",
    customTwitterPrompt: "",
    customLinkedInPrompt: "",
  });

  // Initialize form with user data when available
  useEffect(() => {
    if (user && !isInitialized) {
      const commitPrompt = user.customCommitPrompt || "";
      const twitterPrompt = user.customTwitterPrompt || "";
      const linkedInPrompt = user.customLinkedInPrompt || "";

      setCustomCommitPrompt(commitPrompt);
      setCustomTwitterPrompt(twitterPrompt);
      setCustomLinkedInPrompt(linkedInPrompt);
      setInitialValues({
        customCommitPrompt: commitPrompt,
        customTwitterPrompt: twitterPrompt,
        customLinkedInPrompt: linkedInPrompt,
      });
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!isInitialized) return false;
    return (
      customCommitPrompt.trim() !== initialValues.customCommitPrompt.trim() ||
      customTwitterPrompt.trim() !== initialValues.customTwitterPrompt.trim() ||
      customLinkedInPrompt.trim() !== initialValues.customLinkedInPrompt.trim()
    );
  }, [customCommitPrompt, customTwitterPrompt, customLinkedInPrompt, initialValues, isInitialized]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCustomPrompts({
        customCommitPrompt: customCommitPrompt.trim() || undefined,
        customTwitterPrompt: customTwitterPrompt.trim() || undefined,
        customLinkedInPrompt: customLinkedInPrompt.trim() || undefined,
      });
      // Update initial values after successful save
      setInitialValues({
        customCommitPrompt: customCommitPrompt.trim(),
        customTwitterPrompt: customTwitterPrompt.trim(),
        customLinkedInPrompt: customLinkedInPrompt.trim(),
      });
      toast.success("Custom prompts saved successfully!");
    } catch (error: any) {
      console.error("Failed to save prompts:", error);
      toast.error(error?.message || "Failed to save custom prompts");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setCustomCommitPrompt(user.customCommitPrompt || "");
      setCustomTwitterPrompt(user.customTwitterPrompt || "");
      setCustomLinkedInPrompt(user.customLinkedInPrompt || "");
    }
  };

  const handleReset = async (type: "commit" | "twitter" | "linkedin") => {
    setIsSaving(true);
    try {
      if (type === "commit") {
        setCustomCommitPrompt("");
        await updateCustomPrompts({
          customCommitPrompt: undefined,
        });
        setInitialValues((prev) => ({ ...prev, customCommitPrompt: "" }));
      } else if (type === "twitter") {
        setCustomTwitterPrompt("");
        await updateCustomPrompts({
          customTwitterPrompt: undefined,
        });
        setInitialValues((prev) => ({ ...prev, customTwitterPrompt: "" }));
      } else {
        setCustomLinkedInPrompt("");
        await updateCustomPrompts({
          customLinkedInPrompt: undefined,
        });
        setInitialValues((prev) => ({ ...prev, customLinkedInPrompt: "" }));
      }
      toast.success("Prompt reset to default successfully!");
    } catch (error: any) {
      console.error("Failed to reset prompt:", error);
      toast.error(error?.message || "Failed to reset prompt");
      // Revert state on error
      if (user) {
        if (type === "commit") {
          setCustomCommitPrompt(user.customCommitPrompt || "");
        } else if (type === "twitter") {
          setCustomTwitterPrompt(user.customTwitterPrompt || "");
        } else {
          setCustomLinkedInPrompt(user.customLinkedInPrompt || "");
        }
      }
    } finally {
      setIsSaving(false);
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

      {/* Floating Action Bar for Unsaved Changes */}
      <FloatingSaveFooter isVisible={hasUnsavedChanges} icon={Save} indicatorText="Unsaved changes" onCancel={handleCancel} onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
