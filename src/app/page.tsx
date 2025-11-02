import { StructuredData } from "@/components/landingPageComponents/StructuredData";
// import { LandingNew } from "@/components/landingPageNew/LandingNew";
import { FinalLanding } from "@/components/landingPageComponents/FinalLanding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stop forgetting what you built. Start sharing it.",
  description:
    "Auto Blog turns your daily commits into LinkedIn posts and Twitter threads—automatically. Connect GitHub, keep coding, let AI handle the storytelling. Free during MVP—no credit card required.",
  openGraph: {
    title: "Stop forgetting what you built. Start sharing it.",
    description: "Auto Blog turns your daily commits into LinkedIn posts and Twitter threads—automatically. Connect GitHub, keep coding, let AI handle the storytelling.",
  },
};

export default function Home() {
  return (
    <>
      <StructuredData />
      <FinalLanding />
      {/* Uncomment below to use the old landing page:
      <LandingNew /> */}
    </>
  );
}
