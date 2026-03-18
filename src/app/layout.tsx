import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "xscore — X Algorithm Analyzer",
  description: "Score any X account against the open-source recommendation algorithm",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
