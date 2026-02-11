"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Navbar from "./navbar";
import TopHeader from "./topHeader";

const Header = () => {
  const [activeNavbar, setActiveNavebar] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const getDashboardUrl = () => {
    if (!session?.user) return "/auth/login";

    // DEBUG: Log session data
    console.log("🔍 Session user:", session.user);
    console.log("🔍 User ID:", session.user.id);
    console.log("🔍 Username:", session.user.username);

    const roleSlug = session.user.role?.slug;
    if (roleSlug === "dev" || roleSlug === "admin" || roleSlug === "staff") {
      return process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"; // Admin dashboard (separate app)
    }

    // Client dashboard - use ID (username not always defined)
    const userId = session.user.id || (session.user as any)._id;
    console.log("🔍 Final userId:", userId);

    if (!userId) {
      console.error("❌ No user ID found in session!");
      return "/auth/login";
    }

    return `/${userId}`;
  };

  return (
    <>
      <header className="header header__1">
        {pathname === "/" && <TopHeader />}
      </header>
      <div className="header__bottom">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            {/* Left: Burger + Brand (mobile/tablet) */}
            <div className="d-flex d-xl-none align-items-center gap-3">
              <div
                className="menu__icon"
                onClick={() => setActiveNavebar(!activeNavbar)}
              >
                <i className="bi bi-list" />
              </div>
              <Link href="/" className="header__bottom_brand">
                <Image
                  src="/images/logo-black.svg"
                  alt="CoworKing Café"
                  width={42}
                  height={42}
                  priority
                />
                <span className="header__bottom_brand-name">COWORKING CAFÉ</span>
              </Link>
            </div>

            {/* Left: Logo (desktop only) */}
            <div className="d-none d-xl-flex align-items-center gap-4">
              <Link href="/" className="header__bottom_logo">
                <Image
                  src="/images/logo-black.svg"
                  alt="CoworKing Café by Anticafé Strasbourg - Logo"
                  width={180}
                  height={60}
                  priority
                  style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
                />
              </Link>
            </div>

            <h1 className="sr-only">CoworKing Café by Anticafé Strasbourg</h1>

            {/* Navbar (desktop: inline flex, mobile: absolute slide panel) */}
            <Navbar
              activeNavbar={activeNavbar}
              onClose={() => setActiveNavebar(false)}
            />

            {/* Right: Action buttons */}
            <div className="d-flex align-items-center gap-3">
              {/* Contact - tablet + desktop (≥768px) */}
              <div className="d-none d-md-block">
                <Link href={"/contact#contact"} className="common__btn">
                  <span>Contact</span>
                </Link>
              </div>
              {/* Réserver - tablet + desktop (≥768px) */}
              <div className="d-none d-md-block">
                <Link href="/booking" className="common__btn">
                  <span>Réserver</span>
                  <Image
                    src="/icons/arrow-up-right.svg"
                    alt="Icône lien externe"
                    width={16}
                    height={16}
                    priority
                  />
                </Link>
              </div>
              {/* User menu - always visible */}
              <div className="user-menu-wrapper position-relative">
                {session ? (
                  <>
                    <button
                      className="user-menu-btn user-menu-btn--connected d-flex align-items-center gap-2"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <i className="bi bi-person-circle"></i>
                    </button>
                    {showUserMenu && (
                      <div className="user-menu-dropdown">
                        <Link
                          href={
                            session.user.role?.slug === "dev" ||
                            session.user.role?.slug === "admin" ||
                            session.user.role?.slug === "staff"
                              ? (process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001")
                              : `/${session.user.id}`
                          }
                          className="user-menu-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <i className="bi bi-speedometer2"></i>
                          <span>Dashboard</span>
                        </Link>
                        <button
                          className="user-menu-item"
                          onClick={() => signOut({ callbackUrl: "/" })}
                        >
                          <i className="bi bi-box-arrow-right"></i>
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="user-menu-btn d-flex align-items-center gap-2"
                  >
                    <i className="bi bi-person-circle"></i>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
