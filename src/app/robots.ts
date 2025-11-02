import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://auto-blog-opal.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/private/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
