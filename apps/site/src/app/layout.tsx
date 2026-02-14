import "@/assets/site/scss/critical.scss";
import { DynamicThemeColor } from "@/components/DynamicThemeColor";
import { PWARegister } from "@/components/PWARegister";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Kanit, Poppins } from "next/font/google";
import { SiteProvidersWrapper } from "../components/providers/SiteProvidersWrapper";

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
  title: {
    default: "Cow-or-King Café Strasbourg",
    template: "%s | Cow-or-King Café Strasbourg",
  },
  icons: {
    icon: [
      { url: "/logo/favicon.ico", sizes: "48x48" },
      { url: "/logo/favicon.svg", type: "image/svg+xml" },
      { url: "/logo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/logo/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cow-or-King Café",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Cow-or-King Café Strasbourg",
    images: [
      {
        url: "/images/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Cow-or-King Café Strasbourg - Espace de coworking avec boissons illimitées",
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
        <SiteProvidersWrapper>
          {children}
        </SiteProvidersWrapper>
        <Analytics />
      </body>
    </html>
  );
}
