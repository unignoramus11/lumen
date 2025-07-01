import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { UnifrakturMaguntia, Newsreader } from "next/font/google";
import "./globals.css";

const unifraktur = UnifrakturMaguntia({
  variable: "--font-unifraktur",
  subsets: ["latin"],
  weight: "400",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "700"],
});

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
    </html>
  );
}
