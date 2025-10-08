import { Spinner } from "@/components/ui/spinner";

export function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-12 w-12 text-primary" />
        <p className="text-lg text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );
}
