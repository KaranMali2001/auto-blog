export default function LoaderWithText({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-6">
      {/* Spinner */}
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      {/* Text */}
      <span className="text-muted-foreground text-sm">{text}</span>
    </div>
  );
}
