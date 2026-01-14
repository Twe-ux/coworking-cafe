import "@/assets/site/font/bootstrap-font/bootstrap-icons.min.css";
import "@/assets/site/font/font-awsome/css-js/all.min.css";
import "@/assets/site/font/font-awsome/css-js/all.min.js";
import "@/assets/site/scss/main.scss";
import { SiteProvidersWrapper } from "@/components/providers/SiteProvidersWrapper";
import AhrefsAnalytics from "@/components/site/AhrefsWebAnalytics";
import ExceptionalClosureBanner from "@/components/site/banner/ExceptionalClosureBanner";
import Bootstrap from "@/components/site/Bootstrap";
import Footer from "@/components/site/footer";
import Header from "@/components/site/header/header";
import ScrollToTop from "@/components/site/ui/ScrollToTop";
import PathNameLoad from "@/utils/pathNameLoad";
import { ReactNode } from "react";

export const metadata = {
  title: "CoworKing Café by Anticafé",
  description:
    "CoworKing Café by Anticafé à Strasbourg : espace coworking chaleureux avec Wi-Fi rapide, cafés de qualité et ambiance idéale pour travailler.",
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <AhrefsAnalytics />
      </head>
      <body suppressHydrationWarning>
        <SiteProvidersWrapper>
          <Bootstrap />
          <PathNameLoad />
          <Header />
          <ExceptionalClosureBanner />
          {children}
          <Footer />
          <ScrollToTop />
        </SiteProvidersWrapper>
      </body>
    </html>
  );
}
