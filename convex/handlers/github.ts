import { httpAction } from "../_generated/server";

export const getInstallationUrl = httpAction(async (ctx) => {
  if ((await ctx.auth.getUserIdentity()) == null) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      status: 401,
      headers: new Headers({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        Vary: "origin",
      }),
    });
  }
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const state = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    state: state,
  });
  const appSlug = process.env.GITHUB_APP_SLUG!;
  const authUrl = `https://github.com/apps/${appSlug}/installations/new?${params.toString()}`;

  return new Response(JSON.stringify({ authUrl }), {
    status: 200,
    headers: new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      Vary: "origin",
    }),
  });
});
