import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lone Star Peptides — Quality. Purity. Performance.",
  description:
    "Premium research-grade peptides. RETA, GHK-CU, TESA, MT2, MOTS-C, CJC-1295 & Ipamorelin — for research purposes only.",
  keywords: [
    "research peptides", "RETA", "GHK-CU", "MT2", "CJC-1295", "Ipamorelin",
    "TESA", "MOTS-C", "peptide research", "Lone Star Peptides",
  ],
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
