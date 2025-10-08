import { Card } from "@/components/ui/card";
import { GitBranch } from "lucide-react";

export function EmptyState() {
  return (
    <Card className="p-12">
      <div className="text-center space-y-4">
        <GitBranch className="h-16 w-16 mx-auto text-muted-foreground/50" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">No repositories connected</h2>
          <p className="text-muted-foreground">
            Connect a GitHub repository to start tracking commits
          </p>
        </div>
      </div>
    </Card>
  );
}
