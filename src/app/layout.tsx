import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Visual drag & drop builder for designing Claude Code project structures. Build agents, skills, hooks, and MCP servers on a canvas.";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ccbuilder.dev"),
  title: {
    default: "Claude Code Builder — Visual Project Designer",
    template: "%s | Claude Code Builder",
  },
  description: DESCRIPTION,
  keywords: [
    "claude code",
    "ai agent builder",
    "mcp server",
    "visual designer",
    "claude project",
    "claude code builder",
    "anthropic",
  ],
  authors: [{ name: "ccbuilder.dev", url: "https://ccbuilder.dev" }],
  creator: "ccbuilder.dev",
  openGraph: {
    type: "website",
    url: "https://ccbuilder.dev",
    title: "Claude Code Builder — Visual Project Designer",
    description: DESCRIPTION,
    siteName: "Claude Code Builder",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Code Builder — Visual Project Designer",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "https://ccbuilder.dev" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Claude Code Builder",
              url: "https://ccbuilder.dev",
              description: DESCRIPTION,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
