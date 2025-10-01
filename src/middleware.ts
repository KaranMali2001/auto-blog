import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);
export default clerkMiddleware(async (auth, request) => {
  const { sessionId } = await auth();
  console.log("Session ID:", sessionId);

  // If user is authenticated and on a public route, redirect to dashboard
  if (isPublicRoute(request) && sessionId) {
    console.log("Redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not authenticated and on a protected route, redirect to sign-in
  if (!isPublicRoute(request) && !sessionId) {
    console.log("Redirecting to sign-in");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
});
export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
