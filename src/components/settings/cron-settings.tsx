"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery } from "convex/react";
import { Calendar, Clock, GitBranch, Loader2, Plus, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
interface Repos {
  _id: Id<"repos">;
  _creationTime: number;
  name: string;
  installationId: number;
  userId: Id<"users">;
  repoUrl: string;
}
export function CronSettings({ repos }: { repos: Repos[] }) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [scheduleType, setScheduleType] = React.useState<"preset" | "custom">("preset");
  const [presetCron, setPresetCron] = React.useState("0 9 * * *");
  const [customCron, setCustomCron] = React.useState("0 9 * * *");
  const [selectedRepos, setSelectedRepos] = React.useState<Id<"repos">[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);

  // Custom cron builder state
  const [hour, setHour] = React.useState("9");
  const [minute, setMinute] = React.useState("0");
  const [dayInterval, setDayInterval] = React.useState("1"); // Every X days

  // Queries - Real-time updates
  const cronData = useQuery(api.schema.user_cron.getUserCronsWithHistory);

  // Mutations
  const createCron = useMutation(api.schema.user_cron.createUserCron);
  const updateCronStatus = useMutation(api.schema.user_cron.updateUserCronStatus);
  const deleteCron = useMutation(api.schema.user_cron.deleteUserCron);

  // Build custom cron expression
  const buildCustomCron = () => {
    if (dayInterval === "1") {
      // Every day
      return `${minute} ${hour} * * *`;
    } else {
      // Every X days
      return `${minute} ${hour} */${dayInterval} * *`;
    }
  };

  // Convert Indian time to UTC for display
  const convertToUTC = (hour: number, minute: number) => {
    let utcHour = hour - 5;
    let utcMinute = minute - 30;

    if (utcMinute < 0) {
      utcMinute += 60;
      utcHour -= 1;
    }

    if (utcHour < 0) {
      utcHour += 24;
    }

    if (utcHour >= 24) {
      utcHour -= 24;
    }

    return `${utcHour.toString().padStart(2, "0")}:${utcMinute.toString().padStart(2, "0")}`;
  };

  React.useEffect(() => {
    if (scheduleType === "custom") {
      setCustomCron(buildCustomCron());
    }
  }, [hour, minute, dayInterval, scheduleType]);

  const getCronExpression = () => {
    return scheduleType === "preset" ? presetCron : customCron;
  };

  const handleCreateCron = async () => {
    if (selectedRepos.length === 0) {
      toast.error("Please select at least one repository");
      return;
    }

    try {
      setIsCreating(true);
      await createCron({
        cronExpression: getCronExpression(),
        selectedRepos,
      });
      toast.success("Cron job created successfully");
      setIsCreateDialogOpen(false);
      setPresetCron("0 9 * * *");
      setCustomCron("0 9 * * *");
      setSelectedRepos([]);
      setHour("9");
      setMinute("0");
      setDayInterval("1");
    } catch (error: any) {
      toast.error(error.message || "Failed to create cron job");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleCron = async (cronId: Id<"userCrons">, currentStatus: "enabled" | "disabled", cronExpression: string, repos: Id<"repos">[]) => {
    try {
      const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";
      await updateCronStatus({
        userCronId: cronId,
        status: newStatus,
        cronExpression,
        selectedRepos: repos,
      });
      toast.success(`Cron job ${newStatus === "enabled" ? "enabled" : "disabled"}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update cron status");
    }
  };

  const handleDeleteCron = async (cronId: Id<"userCrons">) => {
    try {
      await deleteCron({ userCronId: cronId });
      toast.success("Cron job deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete cron job");
    }
  };

  const formatCronDescription = (expression: string): string => {
    const [minute, hour, day, month, weekday] = expression.split(" ");

    // Parse the expression
    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);
    const timeStr = `${hourNum.toString().padStart(2, "0")}:${minuteNum.toString().padStart(2, "0")}`;

    // Check for day intervals
    if (day.startsWith("*/")) {
      const interval = day.split("/")[1];
      return `Every ${interval} days at ${timeStr}`;
    }

    // Common patterns
    if (day === "*" && month === "*" && weekday === "*") {
      return `Every day at ${timeStr}`;
    }

    if (weekday === "0") return `Weekly on Sunday at ${timeStr}`;
    if (weekday === "1") return `Weekly on Monday at ${timeStr}`;
    if (day === "1" && month === "*") return `Monthly on 1st at ${timeStr}`;

    return `Custom: ${expression}`;
  };

  const getRepoName = (repoId: Id<"repos">) => {
    if (!repos) return "Unknown";
    const repo = repos.find((r) => r._id === repoId);
    if (!repo) return "Unknown";
    return repo.name;
  };

  const getLastRunText = (timestamp?: number) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getCronHistory = (cronId: Id<"userCrons">) => {
    if (!cronData) return [];
    return cronData.cronHistories.filter((h) => h.userCronId === cronId);
  };

  // Show loading state
  if (cronData === undefined || repos === undefined) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Automated Blog Generation
            </CardTitle>
            <CardDescription>Schedule automated blog posts from your commits</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Cron Schedule</DialogTitle>
                <DialogDescription>Set up automated blog generation from your repository commits</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Schedule Type Toggle */}
                <div className="space-y-2">
                  <Label>Schedule Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant={scheduleType === "preset" ? "default" : "outline"} onClick={() => setScheduleType("preset")} type="button">
                      Preset
                    </Button>
                    <Button variant={scheduleType === "custom" ? "default" : "outline"} onClick={() => setScheduleType("custom")} type="button">
                      Custom
                    </Button>
                  </div>
                </div>

                {/* Preset Selection */}
                {scheduleType === "preset" && (
                  <div className="space-y-2">
                    <Label htmlFor="preset-cron">Choose Schedule</Label>
                    <Select value={presetCron} onValueChange={setPresetCron}>
                      <SelectTrigger id="preset-cron">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0 9 * * *">Every day at 09:00 IST (03:30 UTC)</SelectItem>
                        <SelectItem value="0 0 * * *">Every day at 00:00 IST (18:30 UTC prev day)</SelectItem>
                        <SelectItem value="0 12 * * *">Every day at 12:00 IST (06:30 UTC)</SelectItem>
                        <SelectItem value="0 18 * * *">Every day at 18:00 IST (12:30 UTC)</SelectItem>
                        <SelectItem value="0 9 */2 * *">Every 2 days at 09:00 IST (03:30 UTC)</SelectItem>
                        <SelectItem value="0 9 */3 * *">Every 3 days at 09:00 IST (03:30 UTC)</SelectItem>
                        <SelectItem value="0 9 */7 * *">Every 7 days at 09:00 IST (03:30 UTC)</SelectItem>
                        <SelectItem value="0 0 * * 0">Weekly on Sunday at 00:00 IST (18:30 UTC Sat)</SelectItem>
                        <SelectItem value="0 0 1 * *">Monthly on 1st at 00:00 IST (18:30 UTC prev day)</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground mt-2">
                      <p>⏰ All times shown are in Indian Standard Time (IST)</p>
                      <p>🌍 Cron jobs are automatically converted to UTC for scheduling</p>
                    </div>
                  </div>
                )}

                {/* Custom Builder */}
                {scheduleType === "custom" && (
                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="day-interval" className="text-xs">
                          Every X Days
                        </Label>
                        <Input id="day-interval" type="number" min="1" max="30" value={dayInterval} onChange={(e) => setDayInterval(e.target.value)} placeholder="1" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hour" className="text-xs">
                          Hour (0-23)
                        </Label>
                        <Input id="hour" type="number" min="0" max="23" value={hour} onChange={(e) => setHour(e.target.value)} placeholder="9" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minute" className="text-xs">
                          Minute (0-59)
                        </Label>
                        <Input id="minute" type="number" min="0" max="59" value={minute} onChange={(e) => setMinute(e.target.value)} placeholder="0" />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        ⏰ Indian Time: {hour.padStart(2, "0")}:{minute.padStart(2, "0")}
                      </p>
                      <p>🌍 UTC Time: {convertToUTC(parseInt(hour), parseInt(minute))}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Preview: </span>
                      <span className="font-medium">{formatCronDescription(customCron)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono bg-background px-2 py-1 rounded">Cron: {customCron}</div>
                  </div>
                )}

                {/* Repository Selection */}
                <div className="space-y-2">
                  <Label>Select Repositories</Label>
                  <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
                    {repos.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No repositories found. Connect GitHub first.</p>
                    ) : (
                      repos.map((repo) => (
                        <div key={repo._id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={repo._id}
                            checked={selectedRepos.includes(repo._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRepos([...selectedRepos, repo._id]);
                              } else {
                                setSelectedRepos(selectedRepos.filter((id) => id !== repo._id));
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <label htmlFor={repo._id} className="text-sm flex-1 cursor-pointer">
                            {repo.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedRepos.length} repository(ies) selected</p>
                </div>

                <Button onClick={handleCreateCron} disabled={isCreating || selectedRepos.length === 0} className="w-full">
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Schedule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {cronData.userCrons.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No scheduled jobs yet</p>
            <p className="text-sm text-muted-foreground">Create a schedule to automatically generate blog posts from your commits</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cronData.userCrons.map((cron) => {
              const history = getCronHistory(cron._id);
              const successCount = history.filter((h) => h.status === "success").length;
              const failureCount = history.filter((h) => h.status === "failure").length;

              return (
                <div key={cron._id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCronDescription(cron.cronExpression)}</span>
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">{cron.cronExpression}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {cron.selectedRepos.length} {cron.selectedRepos.length === 1 ? "repo" : "repos"}
                        </span>
                        <span>Last run: {getLastRunText(cron.lastRunAt)}</span>
                        {history.length > 0 && (
                          <span>
                            {successCount} success, {failureCount} failed
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cron.selectedRepos.slice(0, 3).map((repoId) => (
                          <span key={repoId} className="text-xs bg-teal-700 text-white px-2 py-1 rounded">
                            {getRepoName(repoId)}
                          </span>
                        ))}
                        {cron.selectedRepos.length > 3 && <span className="text-xs text-muted-foreground px-2 py-1">+{cron.selectedRepos.length - 3} more</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={cron.status === "enabled"} onCheckedChange={() => handleToggleCron(cron._id, cron.status, cron.cronExpression, cron.selectedRepos)} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Cron Schedule</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this cron schedule? This will permanently remove the schedule for "{formatCronDescription(cron.cronExpression)}" and cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCron(cron._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
