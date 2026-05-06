import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Glossa — In-Depth Language Learning",
  description:
    "Master any language faster with AI-powered learning. Connect across borders with real-time translation networking. Glossa bridges the language gap for healthcare workers, immigrants, remote teams, and global professionals.",
  keywords: [
    "language learning",
    "real-time translation",
    "learn Spanish",
    "language app",
    "translation networking",
    "immigrant language tools",
    "healthcare language learning",
  ],
  openGraph: {
    title: "Glossa — In-Depth Language Learning",
    description:
      "Master any language. Connect with any culture. AI-powered learning meets real-time translation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
