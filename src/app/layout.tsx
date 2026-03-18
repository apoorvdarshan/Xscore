import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const SITE_URL = "https://xscores.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "xscore — X Algorithm Analyzer | Score Your Twitter Account",
    template: "%s | xscore",
  },
  description:
    "Analyze any X (Twitter) account against the open-source recommendation algorithm. Run npx @apoorvdarshan/xscore @username to get your engagement score out of 100, 19 signal breakdown, best/worst tweets, and what's hurting your reach. Free CLI tool.",
  keywords: [
    "X algorithm",
    "Twitter algorithm",
    "Twitter algorithm analyzer",
    "tweet score",
    "engagement analyzer",
    "X recommendation algorithm",
    "phoenix scorer",
    "xai-org x-algorithm",
    "Twitter reach analyzer",
    "tweet analysis tool",
    "social media analytics",
    "Twitter engagement score",
    "X score checker",
    "Twitter algorithm score",
    "how to beat Twitter algorithm",
    "X for you feed algorithm",
    "Twitter engagement rate",
    "xscore",
  ],
  authors: [{ name: "Apoorv Darshan", url: "https://x.com/apoorvdarshan" }],
  creator: "Apoorv Darshan",
  publisher: "Apoorv Darshan",
  applicationName: "xscore",
  category: "Technology",
  classification: "Social Media Analytics Tool",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "xscore — Score Any X Account Against the Algorithm",
    description:
      "Free tool to analyze engagement signals, find what's boosting or hurting your reach, and download a shareable score card. Based on the open-source xai-org/x-algorithm.",
    siteName: "xscore",
    url: SITE_URL,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "xscore — X Algorithm Analyzer",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@apoorvdarshan",
    creator: "@apoorvdarshan",
    title: "xscore — X Algorithm Analyzer",
    description:
      "Score any X account against the open-source recommendation algorithm. 19 engagement signals, per-tweet breakdown, shareable score card.",
    images: ["/og-image.png"],
  },
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={SITE_URL} />
        <meta name="theme-color" content="#030304" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "xscore",
              url: SITE_URL,
              description:
                "Analyze any X (Twitter) account against the open-source recommendation algorithm. Get an engagement score, signal breakdown, and insights.",
              applicationCategory: "UtilityApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "Apoorv Darshan",
                url: "https://x.com/apoorvdarshan",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
