// src/app/(protected)/layout.tsx
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { cookies } from "next/headers";
import { api } from "../../../convex/_generated/api";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  if (!token) throw new Error("User not authenticated");

  const userData = await fetchQuery(api.schema.user.getCurrentUser, {}, { token });

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        userData={{
          name: userData.name || "User",
          email: userData.email,
          imageUrl: userData.imageUrl,
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <ThemeToggle />
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
