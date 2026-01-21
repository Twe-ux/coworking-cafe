"use client";
import { signOut, useSession } from "next-auth/react";
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
    if (!session?.user?.role?.slug) return "/dashboard";
    const roleSlug = session.user.role.slug;
    if (roleSlug === "dev" || roleSlug === "admin" || roleSlug === "staff") {
      return "/dashboard";
    }
    return "/dashboard/client";
  };

  return (
    <>
      <header className="header header__1">
        {pathname === "/" && <TopHeader />}
      </header>
      <div className="header__bottom">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-4">
              <Link href="/" className="header__bottom_logo">
                <img src="/images/logo-black.svg" alt="img" className="" />
              </Link>
              <h1 className="hidden">CoworKing Café</h1>
            </div>

            <Navbar
              activeNavbar={activeNavbar}
              onClose={() => setActiveNavebar(false)}
            />

            <div className="d-flex align-items-center gap-3">
              {session && (
                <div className="user-menu-wrapper position-relative">
                  <button
                    className="user-menu-btn d-flex align-items-center gap-2 "
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <i className="bi bi-person-circle"></i>
                    {/* <span className="d-none d-md-inline">{session.user?.name || "Mon compte"}</span> */}
                  </button>
                  {showUserMenu && (
                    <div className="user-menu-dropdown">
                      <Link
                        href={getDashboardUrl()}
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
                </div>
              )}
              <div className="d-xl-block d-none">
                <Link href={"/contact#contact"} className="common__btn">
                  <span>Contact</span>
                </Link>
              </div>
              <div className="d-xl-block d-none">
                <Link href="/booking" className="common__btn">
                  <span>Réserver</span>
                  <img src="/icons/arrow-up-right.svg" alt="img" />
                </Link>
              </div>
            </div>
            <div
              className="menu__icon d-block d-xl-none"
              onClick={() => setActiveNavebar(!activeNavbar)}
            >
              <i className="bi bi-list" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
