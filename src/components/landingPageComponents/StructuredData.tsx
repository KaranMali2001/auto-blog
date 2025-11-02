export function StructuredData() {
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Auto Blog",
    description: "Automate your developer content. Turn daily GitHub commits into LinkedIn posts and Twitter threads using AI-powered commit summarization.",
    url: "https://auto-blog-opal.vercel.app",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      description: "Free during MVP—no credit card required",
    },
    featureList: [
      "GitHub commit monitoring via webhooks",
      "AI-powered commit summarization",
      "Automated LinkedIn post generation",
      "Twitter thread generation",
      "Real-time commit analysis",
      "Smart file filtering",
      "Multi-repository support",
      "Review and edit before publishing",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "47",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Auto Blog",
    url: "https://auto-blog-opal.vercel.app",
    logo: "https://auto-blog-opal.vercel.app/logo.png",
    description: "Automate your developer content. Turn GitHub commits into social media posts automatically.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      availableLanguage: "English",
    },
    sameAs: [
      // Add social media links when available
      // "https://twitter.com/autoblog",
      // "https://github.com/KaranMali2001/auto-blog",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does Auto Blog work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Auto Blog connects to your GitHub repositories via webhooks. When you push commits, AI analyzes the diffs and generates engaging summaries. You can then turn these summaries into LinkedIn posts or Twitter threads with one click.",
        },
      },
      {
        "@type": "Question",
        name: "Is Auto Blog free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Auto Blog is free during MVP. No credit card required. Just connect your GitHub account and start automating your developer content.",
        },
      },
      {
        "@type": "Question",
        name: "Which AI does Auto Blog use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Auto Blog uses Google Gemini 2.0 Flash via OpenRouter API for commit summarization. This provides fast, accurate, and context-aware summaries of your code changes.",
        },
      },
      {
        "@type": "Question",
        name: "Can I edit the generated content?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Auto Blog generates draft content for you to review and edit before publishing. You have full control over what gets shared.",
        },
      },
      {
        "@type": "Question",
        name: "Does it work with private repositories?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Auto Blog works with both public and private GitHub repositories. Your data is securely processed and never shared.",
        },
      },
      {
        "@type": "Question",
        name: "What platforms can I publish to?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Currently, Auto Blog supports LinkedIn posts and Twitter threads. More platforms are coming soon based on user feedback.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://auto-blog-opal.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Dashboard",
        item: "https://auto-blog-opal.vercel.app/dashboard",
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}
