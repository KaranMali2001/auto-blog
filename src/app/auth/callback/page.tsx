"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export function CallbackComponent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const installation_id = searchParams.get("installation_id");
  const setup_action = searchParams.get("setup_action");
  const state = searchParams.get("state");

  console.log("code", code);
  console.log("installation_id", installation_id);
  console.log("setup_action", setup_action);
  console.log("state", state);
  return (
    <div>
      <h1>Callback Page</h1>
      <p>code: {code}</p>
      <p>installation_id: {installation_id}</p>
      <p>setup_action: {setup_action}</p>
      <p>state: {state}</p>
    </div>
  );
}
export default function CallBackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackComponent />
    </Suspense>
  );
}
