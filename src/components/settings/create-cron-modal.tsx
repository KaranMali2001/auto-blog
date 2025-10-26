"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface CreateCronModalProps {
  repos: { _id: Id<"repos">; name: string }[];
}

export function CreateCronModal({ repos }: CreateCronModalProps) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState("9");
  const [minute, setMinute] = useState("0");
  const [selectedRepos, setSelectedRepos] = useState<Id<"repos">[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createUserCron = useMutation(api.schema.user_cron.createUserCron);

  const handleToggleRepo = (repoId: Id<"repos">) => {
    setSelectedRepos((prev) => (prev.includes(repoId) ? prev.filter((id) => id !== repoId) : [...prev, repoId]));
  };

  const handleSubmit = async () => {
    // Validation
    const hourNum = parseInt(hour, 10);
    const minuteNum = parseInt(minute, 10);

    if (Number.isNaN(hourNum) || hourNum < 0 || hourNum > 23) {
      toast.error("Hour must be between 0 and 23");
      return;
    }

    if (Number.isNaN(minuteNum) || minuteNum < 0 || minuteNum > 59) {
      toast.error("Minute must be between 0 and 59");
      return;
    }

    if (selectedRepos.length === 0) {
      toast.error("Please select at least one repository");
      return;
    }

    // Create cron expression (daily at specified time)
    const cronExpression = `${minuteNum} ${hourNum} * * *`;

    setIsSubmitting(true);
    try {
      await createUserCron({
        selectedRepos,
        cronExpression,
      });
      toast.success("Schedule created successfully");
      // Reset form and close modal
      setHour("9");
      setMinute("0");
      setSelectedRepos([]);
      setOpen(false);
    } catch (error) {
      console.error("Error creating cron:", error);
      toast.error("Failed to create schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Create Automated Schedule</DialogTitle>
          <DialogDescription>Set up a schedule to automatically generate blogs from your commits daily.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Time Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-card-foreground">Schedule Time (IST)</Label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label htmlFor="hour" className="text-xs text-muted-foreground">
                  Hour (0-23)
                </Label>
                <Input id="hour" type="number" min="0" max="23" value={hour} onChange={(e) => setHour(e.target.value)} placeholder="9" className="mt-1 bg-background" />
              </div>
              <div className="pt-6 text-2xl font-bold text-muted-foreground">:</div>
              <div className="flex-1">
                <Label htmlFor="minute" className="text-xs text-muted-foreground">
                  Minute (0-59)
                </Label>
                <Input id="minute" type="number" min="0" max="59" value={minute} onChange={(e) => setMinute(e.target.value)} placeholder="0" className="mt-1 bg-background" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Schedule will run daily at {hour.padStart(2, "0")}:{minute.padStart(2, "0")} IST
            </p>
          </div>

          {/* Repository Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-card-foreground">Select Repositories</Label>
            {repos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No repositories available. Please connect a GitHub account first.</p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto rounded-md border border-border bg-background p-3">
                {repos.map((repo) => (
                  <div key={repo._id} className="flex items-center space-x-2 py-1">
                    <Checkbox id={repo._id} checked={selectedRepos.includes(repo._id)} onCheckedChange={() => handleToggleRepo(repo._id)} />
                    <label htmlFor={repo._id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-card-foreground">
                      {repo.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
            {selectedRepos.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedRepos.length} {selectedRepos.length === 1 ? "repository" : "repositories"} selected
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting} className="min-w-[100px]">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || repos.length === 0} className="min-w-[140px]">
            {isSubmitting ? "Creating..." : "Create Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
