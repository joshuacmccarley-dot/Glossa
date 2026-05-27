import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "sinc'd — Feel connected without questioning",
  description: "The networking app for dating, events, helping out, and real community. $5/month. No swiping.",
  manifest: "/manifest.json",
  themeColor: "#059669",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "sinc'd" },
  openGraph: {
    title: "sinc'd — Feel connected without questioning",
    description: "Dating, events, help, and community in one app. $5/month flat.",
    type: "website",
    siteName: "sinc'd",
  },
  twitter: {
    card: "summary_large_image",
    title: "sinc'd — Feel connected without questioning",
    description: "Dating, events, help, and community in one app. $5/month flat.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
