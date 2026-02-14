// import AhrefsAnalytics from "@/components/site/AhrefsWebAnalytics";
import "@/assets/site/scss/deferred.scss";
import ExceptionalClosureBanner from "../../components/site/banner/ExceptionalClosureBanner";
import Bootstrap from "../../components/site/Bootstrap";
import Footer from "../../components/site/footer";
import Header from "../../components/site/header/header";
import ScrollToTop from "../../components/site/ui/ScrollToTop";
import PathNameLoad from "../../utils/pathNameLoad";
import { PWAStyles } from "../../components/layout/PWAStyles";
import GoogleAnalytics from "../../components/analytics/GoogleAnalytics";
import { OrganizationSchema, WebSiteSchema, LocalBusinessSchema } from "../../components/seo/schemas";
import { ReactNode } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://coworkingcafe.fr"),
  title: "Cow-or-King Café Strasbourg | Espace Coworking avec Boissons Illimitées",
  description:
    "Espace de coworking à Strasbourg centre. Cow-or-King Café by Anticafé : 60 places, +40 boissons illimitées, Wi-Fi rapide. Réservation en ligne. Le café motive, l'humain relie.",
  keywords: [
    "coworking strasbourg",
    "anticafé strasbourg",
    "cow-or-king café strasbourg",
    "espace coworking strasbourg centre",
    "café coworking alsace",
    "coworking boissons illimitées",
    "salle réunion strasbourg",
    "bureau partagé strasbourg",
    "coworking journée strasbourg",
  ],
  openGraph: {
    title: "Cow-or-King Café Strasbourg | Espace Coworking avec Boissons Illimitées",
    description:
      "Espace de coworking au cœur de Strasbourg. +40 boissons illimitées, Wi-Fi rapide, ambiance conviviale. Le café motive • L'humain relie • Vous faites le reste.",
    url: "https://coworkingcafe.fr",
    siteName: "Cow-or-King Café Strasbourg",
    locale: "fr_FR",
    type: "website",
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
    title: "Cow-or-King Café Strasbourg | Coworking + Boissons Illimitées",
    description:
      "Espace de coworking au cœur de Strasbourg. +40 boissons illimitées, Wi-Fi rapide. Réservez votre place !",
    images: ["/images/og-image.webp"],
  },
  alternates: {
    canonical: "https://coworkingcafe.fr",
  },
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
      <LocalBusinessSchema />
      <GoogleAnalytics />
      <PWAStyles />
      <Bootstrap />
      <PathNameLoad />
      <div className="pwa-hide">
        <Header />
        <ExceptionalClosureBanner />
      </div>
      {children}
      <div className="pwa-hide">
        <Footer />
      </div>
      <ScrollToTop />
    </>
  );
}
