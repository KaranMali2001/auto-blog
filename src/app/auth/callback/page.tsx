"use client";

import { useAction } from "convex/react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Github, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../../../convex/_generated/api";

type Status = "loading" | "success" | "error" | "idle";

function CallbackComponent() {
  const searchParams = useSearchParams();
  const installation_id = searchParams.get("installation_id");
  const setup_action = searchParams.get("setup_action");
  const _state = searchParams.get("state");

  const updateInstallation = useAction(api.schema.user.updateInstattionId);
  const router = useRouter();

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (setup_action === "update") {
      setStatus("success");
      toast.success("Installation updated successfully!");
      setTimeout(() => router.push("/settings"), 2500);
      return;
    }

    if (!installation_id) {
      setStatus("error");
      setErrorMessage("No installation ID received from GitHub");
      return;
    }

    setStatus("loading");

    (async () => {
      try {
        await updateInstallation({ installationId: Number(installation_id) });
        setStatus("success");
        toast.success("GitHub connected successfully!");
        setTimeout(() => router.push("/dashboard"), 2500);
      } catch (error: any) {
        console.error("Failed to update installation:", error);
        setStatus("error");
        setErrorMessage(error?.message || "Failed to connect GitHub. Please try again.");
        toast.error(error?.message || "Failed to connect GitHub");
      }
    })();
  }, [installation_id, setup_action, updateInstallation, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="w-full max-w-md">
        <Card className="border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              {status === "loading" && (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}>
                  <Loader2 className="h-8 w-8 text-primary" />
                </motion.div>
              )}
              {status === "success" && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </motion.div>
              )}
              {status === "error" && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </motion.div>
              )}
              {status === "idle" && <Github className="h-8 w-8 text-muted-foreground" />}
            </div>

            <CardTitle className="text-2xl">
              {status === "loading" && "Connecting GitHub..."}
              {status === "success" && "Successfully Connected!"}
              {status === "error" && "Connection Failed"}
              {status === "idle" && "GitHub Integration"}
            </CardTitle>

            <CardDescription>
              {status === "loading" && "Please wait while we set up your GitHub integration"}
              {status === "success" && "Your GitHub account has been connected. Redirecting you now..."}
              {status === "error" && errorMessage}
              {status === "idle" && "Setting up GitHub integration"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {status === "loading" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div className="h-full bg-primary" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, ease: "easeInOut" }} />
                </div>
                <div className="space-y-2 text-center text-sm text-muted-foreground">
                  <p>Verifying installation...</p>
                  <p className="text-xs">Installation ID: {installation_id}</p>
                </div>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                <div className="rounded-lg border border-success/20 bg-success/10 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-success-foreground">Connection established</p>
                      <p className="text-xs text-muted-foreground">
                        {setup_action === "update" ? "Your GitHub app settings have been updated" : "You can now analyze commits and generate blog posts"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Redirecting...</span>
                </div>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-destructive-foreground">Unable to connect</p>
                      <p className="text-xs text-muted-foreground">Please try connecting your GitHub account again</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => router.push("/settings")}>
                    Go to Settings
                  </Button>
                  <Button className="flex-1" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function CallBackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackComponent />
    </Suspense>
  );
}
