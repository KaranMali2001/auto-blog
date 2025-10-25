import { useQueryWithStatus } from "@/app/Providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { formatCronExpression, formatDateTime } from "@/lib/utils";
import { UserCron } from "@/types";
import { useMutation } from "convex/react";
import { Calendar, Edit, History, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

// Cron Section
export function CronSection() {
  const updateCronStatus = useMutation(api.schema.user_cron.updateUserCronStatus);
  const { data: userCronsWithHistory, error: userCronsError, isPending: isUserCronsPending } = useQueryWithStatus(api.schema.user_cron.getUserCronsWithHistory);
  const { data: repos, error: reposError, isPending: isReposPending } = useQueryWithStatus(api.schema.repo.getRepos);
  if (userCronsError) {
    return <ErrorState icon={<Calendar />} title={"An Error occured while loading user crons"} />;
  }
  if (isUserCronsPending) {
    return <Spinner centered title="Loading your schedules..." />;
  }
  if (reposError) {
    return <ErrorState icon={<Calendar />} title={"An Error occured while loading repositories"} />;
  }
  if (isReposPending) {
    return <Spinner centered title="Loading repositories..." />;
  }
  const userCrons = userCronsWithHistory?.userCrons ?? [];

  const handleToggle = async (cron: UserCron, currentStatus: "enabled" | "disabled") => {
    try {
      const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";
      await updateCronStatus({
        userCronId: cron._id,
        status: newStatus,
        selectedRepos: cron.selectedRepos,
        cronExpression: cron.cronExpression,
      });
      toast.success(`Schedule ${newStatus}`);
    } catch (error) {
      console.error("Error toggling cron:", error);
      toast.error("Failed to update schedule");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-card-foreground">Automated Schedules</h2>
          <p className="text-sm text-muted-foreground">Configure automated blog generation schedules</p>
        </div>
        <Button variant={"secondary"}>
          <Plus className="h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      {/* Cron List */}
      {userCrons.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-10 w-10" />}
          title="No automated schedules"
          description="Create a schedule to automatically generate blogs from your commits"
          action={{
            label: "Create Schedule",
            onClick: () => {
              // TODO: Open create schedule modal
              toast.info("Create schedule modal coming soon");
            },
          }}
        />
      ) : (
        <div className="space-y-4">
          {userCrons.map((cron) => (
            <div key={cron._id} className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Schedule Expression */}
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-card-foreground">{formatCronExpression(cron.cronExpression)}</h4>
                      <Badge variant={cron.status === "enabled" ? "success" : "outline"}>{cron.status}</Badge>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{cron.cronExpression}</p>
                  </div>

                  {/* Selected Repositories */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Selected Repositories</Label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {cron.selectedRepos.map((repoId) => {
                        const repo = repos.find((r) => r._id === repoId);
                        return repo ? (
                          <Badge key={repoId} variant="outline" size="sm">
                            {repo.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Last/Next Run */}
                  <div className="flex gap-6 text-xs text-muted-foreground">
                    {cron.lastRunAt && (
                      <div>
                        <span className="font-medium">Last run:</span> {formatDateTime(cron.lastRunAt)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Switch checked={cron.status === "enabled"} onCheckedChange={() => handleToggle(cron, cron.status)} />
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <History className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
