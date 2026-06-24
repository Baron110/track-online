import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TRACK-ONLINE | Global Logistics Intelligence",
  description: "Precision shipment tracking for the modern era. Track any package worldwide in real-time.",
  keywords: ["shipment tracking", "package tracker", "global logistics", "parcel tracking"],
  openGraph: {
    title: "TRACK.ONLINE | Global Shipment Intelligence",
    description: "Track any package worldwide in real-time.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-body-base bg-background text-on-background overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}