"use client";

import { cn } from "@/lib/utils";
import { BookOpen, Code2, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

interface ArticleViewProps {
  content: string;
  className?: string;
}

export function ArticleView({ content, className }: ArticleViewProps) {
  return (
    <div className={cn("article-view-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Main heading with icon
          h1: ({ children }) => (
            <div className="flex items-start gap-3 mb-8 pb-6 border-b border-border">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground leading-tight">{children}</h1>
            </div>
          ),

          // Tags section with icon
          h2: ({ children }) => {
            const content = String(children);
            if (content.startsWith("Tags") || content.match(/^#\w+/)) {
              return (
                <div className="flex items-start gap-3 mb-8 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="p-1.5 rounded bg-primary/10">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {content
                      .split(" ")
                      .filter((tag) => tag.startsWith("#"))
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-background text-primary border border-border hover:bg-primary/5 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              );
            }
            return (
              <div className="mb-6 mt-8 first:mt-0">
                <h2 className="text-2xl font-semibold text-foreground pb-2">{children}</h2>
                <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
              </div>
            );
          },

          // Section headings
          h3: ({ children }) => (
            <div className="mb-4 mt-6">
              <h3 className="text-xl font-semibold text-foreground">{children}</h3>
            </div>
          ),
          h4: ({ children }) => (
            <div className="mb-3 mt-5">
              <h4 className="text-base font-semibold text-muted-foreground">{children}</h4>
            </div>
          ),

          // Paragraph optimized for reading
          p: ({ children }) => <p className="mb-6 leading-[1.8] text-foreground/80 text-base">{children}</p>,

          // Code blocks with icon
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const inline = !match;

            if (inline) {
              return (
                <code className="px-2 py-1 rounded bg-primary/10 text-primary text-sm font-mono border border-primary/20" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <div className="my-6 rounded-lg border border-border overflow-hidden bg-card">
                <div className="flex items-center gap-2 px-4 py-2 bg-muted border-b border-border">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <code className="text-xs text-muted-foreground font-semibold">{match?.[1] || "code"}</code>
                </div>
                <code className={className} {...props}>
                  {children}
                </code>
              </div>
            );
          },

          // Blockquote styled
          blockquote: ({ children }) => (
            <div className="my-6 pl-6 border-l-4 border-primary bg-primary/5 py-4 rounded-r-lg">
              <div className="text-foreground/80 italic leading-relaxed">{children}</div>
            </div>
          ),

          // Lists with better spacing
          ul: ({ children }) => <ul className="list-none space-y-3 mb-6 pl-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-3 mb-6 pl-8 text-foreground/80">{children}</ol>,
          li: ({ children }) => (
            <li className="flex items-start gap-3 text-foreground/80 leading-relaxed">
              <span className="text-primary mt-0.5 font-bold">•</span>
              <span>{children}</span>
            </li>
          ),

          // Links
          a: ({ children, href }) => (
            <a href={href} className="text-primary hover:text-primary/80 underline decoration-2 underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),

          // Horizontal rule with decorative element
          hr: () => (
            <div className="relative my-12">
              <hr className="border-none h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-muted-foreground text-sm">✨</div>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      <style jsx global>{`
        .article-view-content pre {
          background: hsl(var(--muted));
          border-radius: 0;
          padding: 0;
          overflow-x: auto;
          margin: 0;
          border: none;
        }

        .article-view-content pre code {
          background: transparent;
          padding: 1.5rem;
          display: block;
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .article-view-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid hsl(var(--border));
        }

        .article-view-content th,
        .article-view-content td {
          border: 1px solid hsl(var(--border));
          padding: 1rem;
          text-align: left;
        }

        .article-view-content th {
          background: hsl(var(--muted));
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .article-view-content tr:hover {
          background: hsl(var(--muted) / 0.3);
        }
      `}</style>
    </div>
  );
}
