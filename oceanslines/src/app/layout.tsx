import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Roboto_Slab } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
// Logo wordmark only.
const slab = Roboto_Slab({ subsets: ["latin"], weight: ["700"], variable: "--font-slab", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://oceanslines.ge"),
  title: {
    default: "Oceans Lines — Your best line for auto imports",
    template: "%s · Oceans Lines",
  },
  description:
    "Oceans Lines buys at Copart and IAAI, ships across the Atlantic and clears customs in Georgia — one accountable line from auction to your door.",
  openGraph: {
    type: "website",
    url: "https://oceanslines.ge",
    siteName: "Oceans Lines",
    title: "Oceans Lines — Your best line for auto imports",
    description: "US auction buying, ocean logistics and customs clearing to Georgia.",
  },
};

export const viewport: Viewport = {
  themeColor: "#F9F8F6",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${slab.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
