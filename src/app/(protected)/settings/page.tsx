import { SettingsPage } from "@/components/settings/settings";
import { ErrorState } from "@/components/ui/error-state";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

export default async function Page() {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  if (!token) {
    return <ErrorState title="Error" message="You are not logged in" />;
  }
  const user = await fetchQuery(api.schema.user.getCurrentUser, {}, { token });
  if (!user) {
    return <ErrorState title="Error" message="You are not logged in" />;
  }
  return <SettingsPage user={user} />;
}
