/**
 * @file This file defines the root layout for the Lumen Sigma web application.
 * It sets up the basic HTML structure, applies global styles, configures metadata for SEO,
 * and integrates Vercel Analytics and Speed Insights for performance monitoring.
 */

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { UnifrakturMaguntia, Newsreader } from "next/font/google";
import "./globals.css";

/**
 * Configures the 'UnifrakturMaguntia' font from Google Fonts.
 * This font is used for display elements to give a newspaper-like aesthetic.
 * @type {UnifrakturMaguntia}
 */
const unifraktur = UnifrakturMaguntia({
  variable: "--font-unifraktur",
  subsets: ["latin"],
  weight: "400",
});

/**
 * Configures the 'Newsreader' font from Google Fonts.
 * This font is used for body text, providing readability with a classic feel.
 * @type {Newsreader}
 */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "700"],
});

/**
 * Metadata for the application, used for SEO and social media sharing.
 * This object defines the title, description, keywords, authors, icons,
 * Open Graph properties, and Twitter card details.
 * @type {Metadata}
 */
export const metadata: Metadata = {
  title: "Lumen Sigma",
  description: "A hobby project by unignoramus",
  keywords: ["Lumen Sigma", "unignoramus", "hobby project"],
  authors: [
    {
      name: "unignoramus",
      url: "https://github.com/unignoramus11",
    },
  ],
  creator: "unignoramus",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Lumen Sigma",
    description: "A hobby project by unignoramus",
    url: "https://lumen-sigma.vercel.app",
    siteName: "Lumen Sigma",
    images: [
      {
        url: "https://lumen-sigma.vercel.app/logo.png",
        width: 1200,
        height: 630,
        alt: "Lumen Sigma OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumen Sigma",
    description: "A hobby project by unignoramus",
    creator: "@unignoramus11",
    images: ["https://lumen-sigma.vercel.app/logo.png"],
  },
};

/**
 * The root layout component for the Lumen Sigma application.
 * It wraps the entire application, providing a consistent structure,
 * applying global fonts, and integrating analytics tools.
 *
 * @param {Readonly<{ children: React.ReactNode }>} props - The properties for the RootLayout component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The HTML structure for the application's root layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${unifraktur.variable} ${newsreader.variable} antialiased`}
      >
        {children}
      </body>
      <Analytics />
      <SpeedInsights />
    </html>
  );
}
