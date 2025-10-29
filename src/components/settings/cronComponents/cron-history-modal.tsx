import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCronExpression, formatDateTime } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Clock, History } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

interface CronHistoryModalProps {
  cronId: Id<"userCrons">;
  cronExpression: string;
  cronHistories: Array<{
    _id: Id<"cronHistories">;
    _creationTime: number;
    userCronId: Id<"userCrons">;
    runAt: number;
    status: "success" | "failure";
    message?: string;
    error?: string;
    durationMs: number;
    userId: Id<"users">;
  }>;
}

export function CronHistoryModal({ cronId, cronExpression, cronHistories }: CronHistoryModalProps) {
  // Filter histories for this specific cron and sort by most recent first
  const filteredHistories = cronHistories.filter((history) => history.userCronId === cronId).sort((a, b) => b.runAt - a.runAt);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Execution History</DialogTitle>
          <DialogDescription>History for schedule: {formatCronExpression(cronExpression)}</DialogDescription>
        </DialogHeader>

        {filteredHistories.length === 0 ? (
          <div className="py-8">
            <EmptyState icon={<History className="h-10 w-10" />} title="No execution history" description="This schedule hasn't been executed yet" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistories.map((history) => (
              <div
                key={history._id}
                className={`rounded-lg border p-4 transition-colors ${
                  history.status === "success" ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {history.status === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={history.status === "success" ? "success" : "destructive"}>{history.status}</Badge>
                        <span className="text-sm text-muted-foreground">{formatDateTime(history.runAt)}</span>
                      </div>
                      {history.message && <p className="text-sm text-card-foreground">{history.message}</p>}
                      {history.error && (
                        <div className="rounded bg-red-100 dark:bg-red-900/20 p-2">
                          <p className="text-sm font-medium text-red-800 dark:text-red-200 break-words">Error: {history.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{(history.durationMs / 1000).toFixed(2)}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
