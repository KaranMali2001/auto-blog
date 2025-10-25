import { AnalyticsPage } from "@/components/analyticComponents/analytics";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

export default async function Page() {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  if (!token) throw new Error("User not authenticated");

  const blogs = await fetchQuery(api.schema.blog.getBlogs, {}, { token });
  const stats = await fetchQuery(api.schema.user.getUserIntegrationStats, {}, { token });

  return <AnalyticsPage blogs={blogs} stats={stats} />;
}
