import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://auto-blog-opal.vercel.app"),
  title: {
    default: "Auto Blog - Turn Your GitHub Commits into LinkedIn Posts & Twitter Threads",
    template: "%s | Auto Blog",
  },
  description: "Auto Blog automates your developer content. Turn daily GitHub commits into LinkedIn posts and Twitter threads—automatically. AI-powered commit summaries, zero manual writing.",
  keywords: [
    "GitHub commit to blog",
    "automated developer blogging",
    "AI commit summarization",
    "developer content creation",
    "LinkedIn posts for developers",
    "Twitter threads automation",
    "GitHub automation",
    "developer social media",
    "commit summarization AI",
    "automated blog posts",
  ],
  authors: [{ name: "Auto Blog" }],
  creator: "Auto Blog",
  publisher: "Auto Blog",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://auto-blog-opal.vercel.app",
    siteName: "Auto Blog",
    title: "Auto Blog - Turn Your GitHub Commits into LinkedIn Posts & Twitter Threads",
    description: "Automate your developer content. Connect GitHub, let AI watch your commits, and never miss sharing your progress again.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Auto Blog - Automated Developer Content Creation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Blog - Turn Your GitHub Commits into LinkedIn Posts & Twitter Threads",
    description: "Automate your developer content. Connect GitHub, let AI watch your commits, and never miss sharing your progress again.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://auto-blog-opal.vercel.app",
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
  category: "Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
