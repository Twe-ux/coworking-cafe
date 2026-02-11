import "@/assets/site/font/bootstrap-font/bootstrap-icons.min.css";
import "@/assets/site/font/font-awsome/css-js/all.min.css";
import "@/assets/site/scss/main.scss";
import { DynamicThemeColor } from "@/components/DynamicThemeColor";
import { PWARegister } from "@/components/PWARegister";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { ReduxProvider } from "../components/providers/ReduxProvider";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://coworkingcafe.fr"),
  // themeColor managed dynamically by DynamicThemeColor component
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
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
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "CoworKing Café by Anticafé - Espace de coworking à Strasbourg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <Analytics />
        <meta name="theme-color" content="#142220" />
        <style>{`
          /* PWA mode: extend body background behind status bar */
          @media (display-mode: standalone) {
            html, body {
              background-color: #142220 !important;
            }
          }
        `}</style>
      </head>
      <body>
        <PWARegister />
        <DynamicThemeColor />
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
