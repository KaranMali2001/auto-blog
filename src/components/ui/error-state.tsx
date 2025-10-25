"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface ErrorStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function ErrorState({ icon, title = "Something went wrong", message = "An unexpected error occurred. Please try again.", action, className }: ErrorStateProps) {
  return (
    <div className={cn("flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-12 text-center", className)}>
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">{icon || <AlertCircle className="h-10 w-10" />}</div>

      {/* Title */}
      <h3 className="mb-2 text-xl font-semibold text-destructive">{title}</h3>

      {/* Error Message */}
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{message}</p>

      {/* Action Button */}
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
