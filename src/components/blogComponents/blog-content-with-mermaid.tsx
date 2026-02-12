"use client";

import { MarkdownTextView } from "@/components/commitComponents/viewers/markdown-text-view";
import mermaid from "mermaid";
import { useEffect, useMemo, useState } from "react";

const MERMAID_BLOCK_REGEX = /```mermaid\r?\n([\s\S]*?)```/g;

function parseContentWithMermaid(content: string): { type: "text" | "mermaid"; content: string }[] {
  const parts: { type: "text" | "mermaid"; content: string }[] = [];
  let lastIndex = 0;
  let match;
  const regex = new RegExp(MERMAID_BLOCK_REGEX.source, "g");
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: "mermaid", content: match[1].trim() });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push({ type: "text", content: content.slice(lastIndex) });
  }
  return parts.length > 0 ? parts : [{ type: "text", content }];
}

function cleanText(text: string): string {
  return text
    .replace(/[()[\]{}]/g, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeNode(node: string): string {
  // Normalize all node shapes to [] for parser stability.
  return node
    .replace(/^([A-Za-z]\w*)\((.*)\)$/, (_m, id: string, label: string) => `${id}[${cleanText(label)}]`)
    .replace(/^([A-Za-z]\w*)\{(.*)\}$/, (_m, id: string, label: string) => `${id}[${cleanText(label)}]`)
    .replace(/^([A-Za-z]\w*)\[(.*)\]$/, (_m, id: string, label: string) => `${id}[${cleanText(label)}]`);
}

function sanitizeMermaidCode(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];
  let inSubgraph = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^subgraph\b/i.test(trimmed)) {
      inSubgraph = true;
      continue;
    }
    if (trimmed === "end" && inSubgraph) {
      inSubgraph = false;
      continue;
    }
    if (inSubgraph) {
      // Drop subgraph blocks from generated content; these are frequently malformed.
      continue;
    }

    if (trimmed === "" || trimmed.startsWith("%%")) {
      continue;
    }
    if (/^(graph|flowchart)\b/i.test(trimmed)) {
      result.push(trimmed.startsWith("graph") ? trimmed : "graph TD");
      continue;
    }
    // Drop lines that are just node IDs (A, B, C...)
    if (/^[A-Za-z]\w*$/.test(trimmed)) {
      continue;
    }

    let fixed = line;

    // Convert "A -- label --> B" to valid labeled edge.
    const labeled = fixed.match(/^\s*(.+?)\s+--\s+(.+?)\s+-->\s+(.+?)\s*$/);
    if (labeled) {
      const from = normalizeNode(labeled[1].trim());
      const label = cleanText(labeled[2]);
      const to = normalizeNode(labeled[3].trim());
      result.push(`${from} -->|${label}| ${to}`);
      continue;
    }

    // Keep plain arrows, but normalize node shapes.
    const plain = fixed.match(/^\s*(.+?)\s*-->\s*(.+?)\s*$/);
    if (plain) {
      const from = normalizeNode(plain[1].trim());
      const to = normalizeNode(plain[2].trim());
      result.push(`${from} --> ${to}`);
      continue;
    }
  }

  if (result.length === 0) {
    return "graph TD\nA[Diagram] --> B[Could not sanitize Mermaid]";
  }

  if (!/^graph\b/i.test(result[0])) {
    result.unshift("graph TD");
  }

  return result.join("\n");
}

export function BlogContentWithMermaid({ content }: { content: string }) {
  const [renderedDiagrams, setRenderedDiagrams] = useState<Record<number, string>>({});
  const [activeDiagramIndex, setActiveDiagramIndex] = useState<number | null>(null);
  const parts = useMemo(() => parseContentWithMermaid(content), [content]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "neutral",
      securityLevel: "loose",
      suppressErrorRendering: true,
    });
  }, []);

  useEffect(() => {
    const mermaidParts = parts.map((p, i) => (p.type === "mermaid" ? { i, code: p.content } : null)).filter((p): p is { i: number; code: string } => p !== null);

    if (mermaidParts.length === 0) {
      setRenderedDiagrams({});
      return;
    }

    const run = async () => {
      const next: Record<number, string> = {};
      for (const { i, code } of mermaidParts) {
        const sanitized = sanitizeMermaidCode(code);
        try {
          const { svg } = await mermaid.render(`mermaid-${i}-${Date.now()}`, sanitized);
          next[i] = svg;
        } catch {
          next[i] = `__ERROR__${code}`;
        }
      }
      setRenderedDiagrams(next);
    };

    run();
  }, [parts]);

  return (
    <div className="space-y-6">
      {parts.map((part, i) => {
        if (part.type === "text") {
          return (
            <div key={i}>
              <MarkdownTextView content={part.content} />
            </div>
          );
        }

        const svg = renderedDiagrams[i];
        const isError = svg?.startsWith("__ERROR__");

        return (
          <div key={i} className="my-6 flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/30 p-6">
            {svg && !isError ? (
              <button
                type="button"
                onClick={() => {
                  setActiveDiagramIndex(i);
                }}
                className="w-full cursor-zoom-in"
                aria-label="Open diagram preview"
              >
                <div dangerouslySetInnerHTML={{ __html: svg }} className="[&_svg]:max-w-full [&_svg]:mx-auto" />
              </button>
            ) : null}
            {isError ? <pre className="w-full mt-2 font-mono text-sm text-muted-foreground overflow-x-auto bg-muted/50 p-4 rounded">{svg.replace("__ERROR__", "")}</pre> : null}
            {!svg ? <p className="text-xs text-muted-foreground">Rendering diagram...</p> : null}
            <details className="w-full mt-1">
              <summary className="cursor-pointer text-xs text-muted-foreground">Show Mermaid source</summary>
              <pre className="mt-2 font-mono text-sm text-muted-foreground overflow-x-auto bg-muted/50 p-4 rounded">{part.content}</pre>
            </details>
          </div>
        );
      })}

      {activeDiagramIndex !== null && renderedDiagrams[activeDiagramIndex] && !renderedDiagrams[activeDiagramIndex].startsWith("__ERROR__") ? (
        <div
          className="fixed inset-0 z-50 bg-black/80 p-6 flex items-center justify-center"
          onClick={() => {
            setActiveDiagramIndex(null);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setActiveDiagramIndex(null);
            }
          }}
        >
          <div
            className="relative max-h-[90vh] w-[95vw] overflow-auto rounded-lg bg-background p-4"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveDiagramIndex(null);
              }}
              className="absolute right-3 top-3 rounded border border-border bg-background px-2 py-1 text-xs"
            >
              Close
            </button>
            <div dangerouslySetInnerHTML={{ __html: renderedDiagrams[activeDiagramIndex] }} className="[&_svg]:max-w-none [&_svg]:h-auto [&_svg]:mx-auto [&_svg]:min-w-[900px]" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
