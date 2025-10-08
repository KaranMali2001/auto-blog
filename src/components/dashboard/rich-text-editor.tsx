"use client";

import { Button } from "@/components/ui/button";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  CreateLink,
  headingsPlugin,
  InsertCodeBlock,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useRef } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function RichTextEditor({ content, onChange, onSave, onCancel }: RichTextEditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Editor */}
      <div className="mdx-editor-container">
        <MDXEditor
          ref={editorRef}
          markdown={content}
          onChange={onChange}
          className="dark-theme dark-editor"
          contentEditableClassName="prose prose-sm dark:prose-invert max-w-none"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                js: "JavaScript",
                ts: "TypeScript",
                tsx: "TypeScript JSX",
                jsx: "JavaScript JSX",
                python: "Python",
                bash: "Bash",
                json: "JSON",
              },
            }),
            markdownShortcutPlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <BlockTypeSelect />
                  <ListsToggle />
                  <CreateLink />
                  <InsertCodeBlock />
                </>
              ),
            }),
          ]}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 p-3 border-t border-border bg-muted/30">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
