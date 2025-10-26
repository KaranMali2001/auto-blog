"use client";

import { Button } from "@/components/ui/button";
import { AlignCenter, AlignJustify, AlignLeft, X } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlogGenerationFormData } from "@/types/index";

export interface BlogGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCommitCount: number;
  onSubmit: (data: BlogGenerationFormData) => Promise<void>;
}

type PlatformType = "twitter" | "linkedin";
type ToneType = "technical" | "business" | "hiring" | "custom";
type LengthType = "short" | "medium" | "long";

const PLATFORMS: { value: PlatformType; label: string; icon: React.ReactNode }[] = [
  {
    value: "twitter",
    label: "Twitter/X",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
      </svg>
    )
  },
];

const TONES: { value: ToneType; label: string; description: string }[] = [
  { value: "technical", label: "Technical", description: "Deep dive into code and implementation" },
  { value: "business", label: "Business", description: "Focus on impact and outcomes" },
  { value: "hiring", label: "Hiring Manager", description: "Showcase skills and achievements" },
  { value: "custom", label: "Custom", description: "Provide your own tone instructions" },
];

const LENGTHS: { value: LengthType; label: string; words: string; icon: React.ReactNode }[] = [
  { value: "short", label: "Short", words: "200-400 words", icon: <AlignLeft className="h-4 w-4" /> },
  { value: "medium", label: "Medium", words: "400-700 words", icon: <AlignCenter className="h-4 w-4" /> },
  { value: "long", label: "Long", words: "700-1200 words", icon: <AlignJustify className="h-4 w-4" /> },
];

export function BlogGenerationModal({ isOpen, onClose, selectedCommitCount, onSubmit }: BlogGenerationModalProps) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<PlatformType>("linkedin");
  const [toneType, setToneType] = useState<ToneType>("technical");
  const [customTone, setCustomTone] = useState("");
  const [length, setLength] = useState<LengthType>("medium");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        title: title || undefined,
        platform,
        toneType,
        customTone: toneType === "custom" ? customTone : undefined,
        length,
        commitIds: [], // This will be populated by the parent component
      });
      onClose();
      // Reset form
      setTitle("");
      setToneType("technical");
      setCustomTone("");
      setLength("medium");
    } catch (error) {
      console.error("Failed to generate blog:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4">
        <div className="mx-4 max-h-[90vh] overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Generate Blog Post</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedCommitCount} commit{selectedCommitCount !== 1 && "s"} selected
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title">Blog Title (Optional)</Label>
                <Input id="title" placeholder="Leave empty to auto-generate" value={title} onChange={(e) => setTitle(e.target.value)} />
                <p className="text-xs text-muted-foreground">AI will generate a title if left empty</p>
              </div>

              {/* Platform Selection */}
              <div className="space-y-3">
                <Label>Platform</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((p) => {
                    const isSelected = platform === p.value;
                    return (
                      <Button
                        key={p.value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => setPlatform(p.value)}
                        className="flex items-center justify-start gap-3 h-auto py-3"
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                          {p.icon}
                        </div>
                        <span className="font-medium">{p.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Tone Selection */}
              <div className="space-y-3">
                <Label>Tone Type</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {TONES.map((t) => {
                    const isSelected = toneType === t.value;
                    return (
                      <Button
                        key={t.value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => setToneType(t.value)}
                        className="flex flex-col items-start justify-center h-auto py-3 px-4"
                      >
                        <div className="font-medium">{t.label}</div>
                        <div className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {t.description}
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {/* Custom Tone Input */}
                {toneType === "custom" && (
                  <Textarea
                    placeholder="Describe the tone you want (e.g., friendly, formal, humorous)..."
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value)}
                    className="min-h-[100px]"
                  />
                )}
              </div>

              {/* Length Selection */}
              <div className="space-y-3">
                <Label>Length</Label>
                <div className="grid grid-cols-3 gap-3">
                  {LENGTHS.map((l) => {
                    const isSelected = length === l.value;
                    return (
                      <Button
                        key={l.value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => setLength(l.value)}
                        className="flex flex-col items-center justify-center h-auto py-3 px-2 gap-2"
                      >
                        <div className={isSelected ? 'text-primary-foreground' : 'text-primary'}>{l.icon}</div>
                        <div className="text-center">
                          <div className="font-medium">{l.label}</div>
                          <div className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {l.words}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={toneType === "custom" && !customTone.trim()}>
                Generate Blog
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
