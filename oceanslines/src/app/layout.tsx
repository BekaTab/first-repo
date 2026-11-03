import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Georgian, Noto_Serif_Georgian, Playfair_Display, Roboto_Slab } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

// Latin faces first; Georgian glyphs fall through to the matching Noto Georgian face.
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sansKa = Noto_Sans_Georgian({ subsets: ["georgian"], variable: "--font-sans-ka", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const serifKa = Noto_Serif_Georgian({ subsets: ["georgian"], variable: "--font-serif-ka", display: "swap" });
// Logo wordmark only.
const slab = Roboto_Slab({ subsets: ["latin"], weight: ["700"], variable: "--font-slab", display: "swap" });

const title = "Oceans Lines — ავტომობილების იმპორტი აშშ-დან";
const description =
  "Oceans Lines იძენს ავტომობილს Copart-ისა და IAAI-ის აუქციონებზე, ზღვით ჩამოაქვს საქართველოში და გადის განბაჟებას — ერთი პასუხისმგებელი ხაზი აუქციონიდან გასაღებამდე.";

export const metadata: Metadata = {
  metadataBase: new URL("https://oceanslines.ge"),
  title: { default: title, template: "%s · Oceans Lines" },
  description,
  openGraph: {
    type: "website",
    url: "https://oceanslines.ge",
    siteName: "Oceans Lines",
    locale: "ka_GE",
    alternateLocale: ["en_US"],
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#F9F8F6",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ka"
      className={`${sans.variable} ${sansKa.variable} ${serif.variable} ${serifKa.variable} ${slab.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
