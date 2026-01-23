import type { Metadata } from "next";
import "@/assets/site/font/bootstrap-font/bootstrap-icons.min.css";
import "@/assets/site/font/font-awsome/css-js/all.min.css";
import "@/assets/site/scss/main.scss";
import { ReduxProvider } from "../components/providers/ReduxProvider";
import { PWARegister } from "@/components/PWARegister";

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  themeColor: '#1A1A1A',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CoworKing Café',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <PWARegister />
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
