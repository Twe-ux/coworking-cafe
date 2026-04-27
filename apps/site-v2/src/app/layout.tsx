import { cn } from "@/lib/cn";
import { fraunces, inter, jetbrainsMono } from "@/lib/fonts";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_URL ?? "https://coworkingcafe.fr",
  ),
  title: {
    default: "CoworKing Café Strasbourg — Coworking + Café",
    template: "%s | CoworKing Café Strasbourg",
  },
  description:
    "Espace de coworking chaleureux au cœur de Strasbourg. WiFi fibre, café à volonté, salles de réunion privatisables. Dès 9€/h. Ouvert 7j/7, 9h-20h.",
  keywords: [
    "coworking strasbourg",
    "espace de coworking strasbourg",
    "café coworking strasbourg",
    "salle réunion strasbourg",
    "bureau partagé strasbourg",
    "coworking centre ville strasbourg",
  ],
  authors: [{ name: "CoworKing Café" }],
  creator: "CoworKing Café",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "CoworKing Café Strasbourg",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CoworKing Café Strasbourg — Coworking + Café",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // iOS PWA — keeps standalone mode across all routes (scope "/" in manifest)
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CoworKing",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF6EE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={cn(
        fraunces.variable,
        inter.variable,
        jetbrainsMono.variable,
        "font-sans",
      )}
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
