"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Save, X, LucideIcon } from "lucide-react";

export interface FloatingSaveFooterProps {
  /** Whether the footer should be visible */
  isVisible: boolean;
  /** Icon to display in the indicator */
  icon: LucideIcon;
  /** Text to display in the indicator */
  indicatorText: string;
  /** Handler for cancel action */
  onCancel?: () => void;
  /** Handler for save action */
  onSave: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Whether save button should be disabled */
  isSaveDisabled?: boolean;
  /** Custom save button text (defaults to "Save Changes") */
  saveButtonText?: string;
  /** Custom cancel button text (defaults to "Cancel") */
  cancelButtonText?: string;
  /** Size of the save button */
  saveButtonSize?: "sm" | "lg";
}

export function FloatingSaveFooter({
  isVisible,
  icon: Icon,
  indicatorText,
  onCancel,
  onSave,
  isSaving = false,
  isSaveDisabled = false,
  saveButtonText = "Save Changes",
  cancelButtonText = "Cancel",
  saveButtonSize = "sm",
}: FloatingSaveFooterProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
      <div className="rounded-full border border-border bg-card shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-4 px-6 py-4">
          {/* Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-card-foreground">{indicatorText}</span>
          </div>

          {/* Divider */}
          {onCancel && <div className="h-6 w-px bg-border" />}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
                <X className="h-4 w-4" />
                {cancelButtonText}
              </Button>
            )}
            <Button variant="primary" size={saveButtonSize} onClick={onSave} disabled={isSaving || isSaveDisabled}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {saveButtonText}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
