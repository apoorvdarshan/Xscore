import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "xscore — X Algorithm Analyzer | Score Your Account",
  description:
    "Analyze any X (Twitter) account against the open-source recommendation algorithm. See your engagement score, 19 signal breakdown, best/worst tweets, and what's hurting your reach.",
  keywords: [
    "X algorithm",
    "Twitter algorithm",
    "tweet score",
    "engagement analyzer",
    "X recommendation algorithm",
    "phoenix scorer",
    "xai-org",
    "Twitter reach",
    "tweet analysis",
    "social media analytics",
  ],
  authors: [{ name: "Apoorv Darshan", url: "https://x.com/apoorvdarshan" }],
  creator: "Apoorv Darshan",
  openGraph: {
    title: "xscore — Score Any X Account Against the Algorithm",
    description:
      "Analyze engagement signals, find what's boosting or hurting your reach, and download a shareable score card. Based on the open-source xai-org/x-algorithm.",
    siteName: "xscore",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "xscore — X Algorithm Analyzer",
    description:
      "Score any X account against the open-source recommendation algorithm. 19 engagement signals, per-tweet breakdown, shareable score card.",
    creator: "@apoorvdarshan",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
