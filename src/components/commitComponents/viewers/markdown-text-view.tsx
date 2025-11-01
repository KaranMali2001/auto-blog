"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

interface MarkdownTextViewProps {
  content: string;
  className?: string;
}

export function MarkdownTextView({ content, className }: MarkdownTextViewProps) {
  return (
    <div className={cn("markdown-content prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Customize heading styles
          h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground">{children}</h1>,
          h2: ({ children }) => {
            const content = String(children);
            // Check if it's a tags section (starts with ## Tags or similar)
            if (content.startsWith("Tags") || content.match(/^#\w+/)) {
              return (
                <div className="flex flex-wrap gap-2 my-3">
                  {content
                    .split(" ")
                    .filter((tag) => tag.startsWith("#"))
                    .map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {tag}
                      </span>
                    ))}
                </div>
              );
            }
            return <h2 className="text-xl font-semibold mt-5 mb-3 text-foreground">{children}</h2>;
          },
          h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-semibold mt-3 mb-2 text-foreground">{children}</h4>,

          // Customize paragraph
          p: ({ children }) => <p className="mb-4 leading-relaxed text-foreground/90">{children}</p>,

          // Customize code blocks
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const inline = !match;

            return inline ? (
              <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-foreground" {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },

          // Customize blockquote
          blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">{children}</blockquote>,

          // Customize lists
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
          li: ({ children }) => <li className="text-foreground/90">{children}</li>,

          // Customize links
          a: ({ children, href }) => (
            <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),

          // Customize horizontal rule
          hr: () => <hr className="my-6 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>

      <style jsx global>{`
        .markdown-content pre {
          background: hsl(var(--muted));
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
          border: 1px solid hsl(var(--border));
        }

        .markdown-content pre code {
          background: transparent;
          padding: 0;
        }

        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .markdown-content th,
        .markdown-content td {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem;
          text-align: left;
        }

        .markdown-content th {
          background: hsl(var(--muted));
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
