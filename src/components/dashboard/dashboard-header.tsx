import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export function DashboardHeader() {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">View your repositories and commits</p>
        </div>
        <div className="flex items-center gap-4"></div>
      </div>
      <Separator />
    </>
  );
}
