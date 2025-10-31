"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { useEffect, useState } from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";

interface DiffViewerProps {
  oldString: string;
  newString: string;
  title?: string;
}

export function DiffViewer({ oldString, newString, title = "Summary Changes" }: DiffViewerProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Get CSS variables for theming
  const getThemeStyles = () => {
    if (isDark) {
      return {
        diffViewerBackground: "hsl(var(--card))",
        diffViewerColor: "hsl(var(--foreground))",
        addedBackground: "rgba(34, 197, 94, 0.15)",
        addedColor: "rgb(34, 197, 94)",
        removedBackground: "rgba(239, 68, 68, 0.15)",
        removedColor: "rgb(239, 68, 68)",
        wordAddedBackground: "rgba(34, 197, 94, 0.3)",
        wordRemovedBackground: "rgba(239, 68, 68, 0.3)",
        addedGutterBackground: "rgba(34, 197, 94, 0.1)",
        removedGutterBackground: "rgba(239, 68, 68, 0.1)",
        gutterBackground: "hsl(var(--muted))",
        gutterBackgroundDark: "hsl(var(--muted))",
        highlightBackground: "rgba(251, 146, 60, 0.15)",
        highlightGutterBackground: "rgba(251, 146, 60, 0.15)",
        codeFoldGutterBackground: "hsl(var(--muted))",
        codeFoldBackground: "hsl(var(--muted))",
        emptyLineBackground: "hsl(var(--background))",
        gutterColor: "hsl(var(--muted-foreground))",
        addedGutterColor: "rgb(34, 197, 94)",
        removedGutterColor: "rgb(239, 68, 68)",
        codeFoldContentColor: "hsl(var(--muted-foreground))",
        diffViewerTitleBackground: "hsl(var(--muted))",
        diffViewerTitleColor: "hsl(var(--foreground))",
        diffViewerTitleBorderColor: "hsl(var(--border))",
      };
    }

    return {
      diffViewerBackground: "hsl(var(--card))",
      diffViewerColor: "hsl(var(--foreground))",
      addedBackground: "rgba(34, 197, 94, 0.1)",
      addedColor: "rgb(21, 128, 61)",
      removedBackground: "rgba(239, 68, 68, 0.1)",
      removedColor: "rgb(185, 28, 28)",
      wordAddedBackground: "rgba(34, 197, 94, 0.25)",
      wordRemovedBackground: "rgba(239, 68, 68, 0.25)",
      addedGutterBackground: "rgba(34, 197, 94, 0.08)",
      removedGutterBackground: "rgba(239, 68, 68, 0.08)",
      gutterBackground: "hsl(var(--muted))",
      gutterBackgroundDark: "hsl(var(--muted))",
      highlightBackground: "rgba(251, 146, 60, 0.1)",
      highlightGutterBackground: "rgba(251, 146, 60, 0.1)",
      codeFoldGutterBackground: "hsl(var(--muted))",
      codeFoldBackground: "hsl(var(--muted))",
      emptyLineBackground: "hsl(var(--background))",
      gutterColor: "hsl(var(--muted-foreground))",
      addedGutterColor: "rgb(21, 128, 61)",
      removedGutterColor: "rgb(185, 28, 28)",
      codeFoldContentColor: "hsl(var(--muted-foreground))",
      diffViewerTitleBackground: "hsl(var(--muted))",
      diffViewerTitleColor: "hsl(var(--foreground))",
      diffViewerTitleBorderColor: "hsl(var(--border))",
    };
  };

  const themeStyles = getThemeStyles();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4 text-orange-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              <span>Previous Summary</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span>New Summary</span>
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <ReactDiffViewer
              oldValue={oldString}
              newValue={newString}
              splitView={true}
              compareMethod={DiffMethod.WORDS}
              disableWordDiff={false}
              useDarkTheme={isDark}
              leftTitle="Previous Summary"
              rightTitle="New Summary"
              styles={{
                variables: {
                  dark: themeStyles,
                  light: themeStyles,
                },
                diffContainer: {
                  fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace)',
                  fontSize: "14px",
                  lineHeight: "1.5",
                },
                marker: {
                  display: "none",
                },
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
