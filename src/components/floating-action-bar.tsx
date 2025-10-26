"use client";

import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FloatingActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onGenerateBlog: () => void;
  className?: string;
}

export function FloatingActionBar({ selectedCount, onClearSelection, onGenerateBlog, className }: FloatingActionBarProps) {
  const isVisible = selectedCount > 0;

  return (
    <div
      className={cn("fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transition-all duration-300", isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0", className)}
    >
      <div className="animate-in fade-in slide-in-from-bottom-2 rounded-full border border-border bg-card shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-4 px-6 py-4">
          {/* Selection Count */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{selectedCount}</div>
            <span className="text-sm font-medium text-card-foreground">commit{selectedCount !== 1 && "s"} selected</span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <X className="h-4 w-4" />
              Clear
            </Button>
            <Button variant="primary" size="lg" onClick={onGenerateBlog}>
              <Sparkles className="h-4 w-4" />
              Generate Blog
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
