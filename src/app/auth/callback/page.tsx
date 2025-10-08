"use client";

import LoaderWithText from "@/components/ui/loading";
import { useAction } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";

export function CallbackComponent() {
  const searchParams = useSearchParams();
  const installation_id = searchParams.get("installation_id");
  const setup_action = searchParams.get("setup_action");
  const state = searchParams.get("state");

  const updateInstallation = useAction(api.schema.user.updateInstattionId);
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!installation_id) return;

    setLoading(true);

    (async () => {
      try {
        await updateInstallation({ installationId: Number(installation_id) });
        toast.success("Installation updated successfully. Redirecting to Dashboard...");
        setTimeout(() => router.push("/dashboard"), 2000);
      } catch (error: any) {
        console.error("Failed to update installation:", error);
        toast.error(error?.message || "Failed to update installation");
      } finally {
        setLoading(false);
      }
    })();
  }, [installation_id, updateInstallation, router]);

  if (loading) {
    return <LoaderWithText text="Updating installation..." />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 text-muted-foreground min-h-screen">
      <h1 className="text-xl font-semibold">Callback Page</h1>
      <div className="space-y-2">
        <p>
          <span className="font-medium">Installation ID:</span> {installation_id ?? "N/A"}
        </p>
        <p>
          <span className="font-medium">Setup Action:</span> {setup_action ?? "N/A"}
        </p>
        <p>
          <span className="font-medium">State:</span> {state ?? "N/A"}
        </p>
      </div>
    </div>
  );
}

export default function CallBackPage() {
  <Suspense fallback={<LoaderWithText text="Loading..." />}>
    <CallbackComponent />
  </Suspense>;
}
