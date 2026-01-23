import "@/assets/site/font/bootstrap-font/bootstrap-icons.min.css";
import "@/assets/site/font/font-awsome/css-js/all.min.css";
import "@/assets/site/scss/main.scss";
import { PWARegister } from "@/components/PWARegister";
import { DynamicThemeColor } from "@/components/DynamicThemeColor";
import type { Metadata } from "next";
import { ReduxProvider } from "../components/providers/ReduxProvider";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
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
