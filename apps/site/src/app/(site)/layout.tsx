import { SiteProvidersWrapper } from "../../components/providers/SiteProvidersWrapper";
// import AhrefsAnalytics from "@/components/site/AhrefsWebAnalytics";
import ExceptionalClosureBanner from "../../components/site/banner/ExceptionalClosureBanner";
import Bootstrap from "../../components/site/Bootstrap";
import Footer from "../../components/site/footer";
import Header from "../../components/site/header/header";
import ScrollToTop from "../../components/site/ui/ScrollToTop";
import PathNameLoad from "../../utils/pathNameLoad";
import { PWAStyles } from "../../components/layout/PWAStyles";
import { ReactNode } from "react";

export const metadata = {
  title: "CoworKing Café by Anticafé",
  description:
    "CoworKing Café by Anticafé à Strasbourg : espace coworking chaleureux avec Wi-Fi rapide, cafés de qualité et ambiance idéale pour travailler.",
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SiteProvidersWrapper>
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
    </SiteProvidersWrapper>
  );
}
