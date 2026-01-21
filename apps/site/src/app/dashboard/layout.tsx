import "@/assets/dashboard/scss/app.scss";

import Footer from "../../components/dashboard/layout/Footer";
import AppProvidersWrapper from "../../components/dashboard/wrappers/AppProvidersWrapper";
import AuthProtectionWrapper from "../../components/dashboard/wrappers/AuthProtectionWrapper";
import LayoutSettingsReset from "../../components/dashboard/wrappers/LayoutSettingsReset";
import dynamic from "next/dynamic";
import { Figtree } from "next/font/google";
import Image from "next/image";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";
import { Container } from "react-bootstrap";
import logoDark from "/public/images/logo-black.svg";

const TopNavigationBar = dynamic(
  () => import("../../components/dashboard/layout/TopNavigationBar/page"),
);
const VerticalNavigationBar = dynamic(
  () => import("../../components/dashboard/layout/VerticalNavigationBar/page"),
);

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const splashScreenStyles = `
#splash-screen {
  position: fixed;
  top: 50%;
  left: 50%;
  background: white;
  display: flex;
  height: 100%;
  width: 100%;
  transform: translate(-50%, -50%);
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 1;
  transition: all 15s linear;
  overflow: hidden;
}

#splash-screen.remove {
  animation: fadeout 0.7s forwards;
  z-index: 0;
}

@keyframes fadeout {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
`;

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style suppressHydrationWarning>{splashScreenStyles}</style>
      </head>
      <body className={figtree.className}>
        <div id="splash-screen">
          <Image
            alt="Logo"
            src={logoDark}
            style={{ height: "50%", width: "auto" }}
            priority
          />
        </div>
        <NextTopLoader color="#604ae3" showSpinner={false} />
        <LayoutSettingsReset />
        <div id="__next_splash">
          <AppProvidersWrapper>
            <AuthProtectionWrapper>
              <div className="wrapper">
                <Suspense>
                  <TopNavigationBar />
                </Suspense>
                <VerticalNavigationBar />
                <div className="page-content">
                  <Container fluid className="px-2 py-2">
                    {children}
                  </Container>
                  <Footer />
                </div>
              </div>
            </AuthProtectionWrapper>
          </AppProvidersWrapper>
        </div>
      </body>
    </html>
  );
}
