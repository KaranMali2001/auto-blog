import { Separator } from "@/components/ui/separator";
import React from "react";

export function extractTags(text: string): string[] {
  const tagLine = text.split("\n").find((line) => line.startsWith("#"));
  if (tagLine) {
    return tagLine
      .split(" ")
      .filter((word) => word.startsWith("#"))
      .map((tag) => tag.slice(1));
  }
  return [];
}

export function renderMarkdown(text: string): React.ReactElement[] {
  const lines = text.split("\n");
  const elements: React.ReactElement[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  lines.forEach((line, index) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${index}`} className="bg-muted/50 border border-border p-4 rounded-lg my-3 overflow-x-auto">
            <code className="text-sm font-mono">{codeLines.join("\n")}</code>
          </pre>,
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={index} className="text-2xl font-bold mt-6 mb-3 flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-primary" />
          {line.replace("## ", "")}
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={index} className="text-xl font-semibold mt-5 mb-2">
          {line.replace("### ", "")}
        </h3>,
      );
    } else if (line.startsWith("# ") && !line.startsWith("#")) {
      return;
    } else if (line.match(/^\d+\.\s+\*\*/)) {
      const match = line.match(/^\d+\.\s+\*\*(.+?)\*\*:?\s*(.*)/);
      if (match) {
        elements.push(
          <div key={index} className="ml-6 mb-2 flex gap-2">
            <span className="font-semibold text-primary">{match[1]}:</span>
            <span className="text-muted-foreground">{match[2]}</span>
          </div>,
        );
      }
    } else if (line.match(/^\d+\./)) {
      elements.push(
        <li key={index} className="ml-6 mb-2 text-muted-foreground">
          {line.replace(/^\d+\.\s*/, "")}
        </li>,
      );
    } else if (line.startsWith("- ")) {
      const content = line.replace("- ", "");
      const boldMatch = content.match(/\*\*(.+?)\*\*:?\s*(.*)/);
      if (boldMatch) {
        elements.push(
          <li key={index} className="ml-6 mb-2 flex gap-2">
            <span className="font-semibold text-primary">{boldMatch[1]}:</span>
            <span className="text-muted-foreground">{boldMatch[2]}</span>
          </li>,
        );
      } else {
        elements.push(
          <li key={index} className="ml-6 mb-2 text-muted-foreground">
            {content}
          </li>,
        );
      }
    } else if (line.startsWith("*   **")) {
      const match = line.match(/\*\s+\*\*(.+?)\*\*:?\s*(.*)/);
      if (match) {
        elements.push(
          <div key={index} className="ml-6 mb-2 flex gap-2">
            <span className="font-semibold text-primary">{match[1]}:</span>
            <span className="text-muted-foreground">{match[2]}</span>
          </div>,
        );
      }
    } else if (line.startsWith("---")) {
      elements.push(<Separator key={index} className="my-4" />);
    } else if (line.trim()) {
      const formattedLine = line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
        .replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

      elements.push(
        <p
          key={index}
          className="mb-3 text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />,
      );
    }
  });

  return elements;
}
