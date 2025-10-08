import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./theme-toggle";

export function DashboardHeader() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">View your repositories and commits</p>
        </div>
        <ThemeToggle />
      </div>
      <Separator />
    </>
  );
}
