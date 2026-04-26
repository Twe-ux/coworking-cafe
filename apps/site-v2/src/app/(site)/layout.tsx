import { NavWrapper } from "@/components/layout/NavWrapper";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavWrapper />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
