import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Trinetra } from "@/lib/trinetra";

// Initialize Trinetra Telemetry SDK
Trinetra.init({
  endpoint: "https://trinetra-ai-ten.vercel.app/api/telemetry"
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Trinetra AI - Modern API Observability",
  description: "AI-powered API reliability and incident monitoring platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
