"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient, useQueries } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
export const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ConvexQueryCacheProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </ConvexQueryCacheProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
