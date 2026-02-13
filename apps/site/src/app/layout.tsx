import "@/assets/site/scss/critical.scss";
import { DynamicThemeColor } from "@/components/DynamicThemeColor";
import { DeferredBootstrapIcons } from "@/components/common/DeferredBootstrapIcons";
import { DeferredStyles } from "@/components/common/DeferredStyles";
import { PWARegister } from "@/components/PWARegister";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Kanit, Poppins } from "next/font/google";
import { ReduxProvider } from "../components/providers/ReduxProvider";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-kanit",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#142220",
};

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://coworkingcafe.fr"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Status bar translucent on colored background
    title: "CoworKing Café",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "CoworKing Café by Anticafé",
    images: [
      {
        url: "/images/og-image.webp",
        width: 1200,
        height: 630,
        alt: "CoworKing Café by Anticafé - Espace de coworking à Strasbourg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og-image.webp"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${kanit.variable} ${poppins.variable}`}>
      <body>
        <style>{`
          /* PWA mode: extend body background behind status bar */
          @media (display-mode: standalone) {
            html, body {
              background-color: #142220 !important;
            }
          }
        `}</style>
        <PWARegister />
        <DynamicThemeColor />
        <DeferredBootstrapIcons />
        <DeferredStyles />
        <ReduxProvider>{children}</ReduxProvider>
        <Analytics />
      </body>
    </html>
  );
}
