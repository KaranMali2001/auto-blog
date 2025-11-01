"use client";

import { FileText, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewType = "markdown" | "article";

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  const views: { type: ViewType; label: string; icon: React.ReactNode }[] = [
    {
      type: "markdown",
      label: "Markdown",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      type: "article",
      label: "Article",
      icon: <Newspaper className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg border border-border">
      {views.map((view) => (
        <Button
          key={view.type}
          variant="ghost"
          size="sm"
          onClick={() => onViewChange(view.type)}
          className={cn("flex items-center gap-2 transition-all", currentView === view.type ? "bg-background shadow-sm" : "hover:bg-background/50")}
        >
          {view.icon}
          <span className="text-xs font-medium">{view.label}</span>
        </Button>
      ))}
    </div>
  );
}
