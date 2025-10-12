import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

export function DashboardHeader() {
  const router = useRouter();
  
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">View your repositories and commits</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push("/blog")}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            My Blogs
          </Button>
          <ThemeToggle />
        </div>
      </div>
      <Separator />
    </>
  );
}
