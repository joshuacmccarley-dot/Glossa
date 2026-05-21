import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "sinc'd — Match on what actually matters",
  description: "Connect with people who share your passions. Interest-based matching with a 12-hour connection window. Just $5/month for everything.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
