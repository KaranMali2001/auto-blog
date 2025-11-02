import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Auto Blog",
    short_name: "Auto Blog",
    description: "Automate your developer content. Turn daily GitHub commits into LinkedIn posts and Twitter threads—automatically.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#5ce7ff",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["productivity", "developer", "blog"],
  };
}
