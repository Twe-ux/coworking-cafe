"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/",           label: "Accueil" },
  { href: "/espaces",    label: "Espaces" },
  { href: "/concept",    label: "Concept" },
  { href: "/tarifs",     label: "Tarifs" },
  { href: "/menu",       label: "Menu" },
  { href: "/evenements", label: "Événements" },
] as const;

interface NavProps {
  variant?: "light" | "dark";
  currentPath?: string;
}

export function Nav({ variant = "light", currentPath = "/" }: NavProps) {
  const isDark = variant === "dark";

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b",
        "backdrop-blur-[20px]",
        isDark
          ? "bg-[rgba(11,21,19,0.8)] border-[rgba(255,255,255,0.1)] text-white"
          : "bg-[rgba(250,246,238,0.85)] border-[var(--line)] text-[var(--body)]"
      )}
      aria-label="Navigation principale"
    >
      <div className="wrap flex items-center gap-[clamp(14px,2vw,28px)] py-[18px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-[10px] shrink-0 no-underline text-inherit">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ background: "var(--btn)" }}
          >
            <Icon name="building" size={18} stroke="#1A1A1A" />
          </div>
          <div>
            <div className="font-serif text-[16px] tracking-[-0.01em] leading-none">
              CoworKing Café
            </div>
            <div className="font-mono text-[9px] tracking-[0.14em] opacity-50 mt-[3px]">
              STRASBOURG · EST. 2022
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex flex-1 justify-center gap-[clamp(14px,2vw,26px)]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[13.5px] font-medium py-2 no-underline text-inherit transition-opacity",
                currentPath === link.href ? "opacity-100" : "opacity-[0.72] hover:opacity-100"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-[10px] shrink-0">
          <Link
            href="/login"
            className="text-[13.5px] font-medium opacity-[0.72] hover:opacity-100 no-underline text-inherit"
          >
            Se connecter
          </Link>
          <Link href="/booking">
            <Button variant={isDark ? "primary" : "dark"} size="sm">
              Réserver
            </Button>
          </Link>
        </div>

        {/* Mobile burger */}
        <div className="lg:hidden ml-auto">
          <MobileNav isDark={isDark} currentPath={currentPath} />
        </div>
      </div>
    </nav>
  );
}

function MobileNav({ isDark, currentPath }: { isDark: boolean; currentPath: string }) {
  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          "p-[6px] rounded-[8px]",
          isDark ? "text-white hover:bg-[rgba(255,255,255,0.1)]" : "text-[var(--body)] hover:bg-[var(--line)]"
        )}
        aria-label="Ouvrir le menu"
      >
        <Icon name="menu" size={22} stroke="currentColor" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className={cn("w-[300px] p-0", isDark ? "text-white" : "text-[var(--body)]")}
        style={{ background: isDark ? "#0B1513" : "var(--cream)" }}
        showCloseButton={false}
      >
        <nav className="flex flex-col p-6 gap-1" aria-label="Menu mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "py-[14px] px-3 text-[15px] font-medium rounded-[10px] no-underline text-inherit",
                "border-b border-[var(--line)] last:border-0",
                currentPath === link.href
                  ? "opacity-100"
                  : "opacity-70 hover:opacity-100 hover:bg-[var(--line)]"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/login" className="no-underline">
              <Button variant="ghost" className="w-full">Se connecter</Button>
            </Link>
            <Link href="/booking" className="no-underline">
              <Button variant="primary" className="w-full">Réserver</Button>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
