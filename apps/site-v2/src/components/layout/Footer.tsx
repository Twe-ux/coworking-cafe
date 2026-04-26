import Link from "next/link";
import Image from "next/image";

const COLUMNS = [
  {
    title: "Espaces",
    links: [
      { label: "Open-space", href: "/espaces#open-space" },
      { label: "Salle Verrière", href: "/espaces#verriere" },
      { label: "Salle Étage", href: "/espaces#etage" },
      { label: "Événementiel", href: "/espaces#event" },
    ],
  },
  {
    title: "Le lieu",
    links: [
      { label: "Concept", href: "/concept" },
      { label: "Menu boissons", href: "/menu" },
      { label: "Événements", href: "/evenements" },
      { label: "Tarifs", href: "/tarifs" },
    ],
  },
  {
    title: "Membre",
    links: [
      { label: "Connexion", href: "/login" },
      { label: "Mon espace", href: "/dashboard" },
      { label: "Programme fidélité", href: "/dashboard/loyalty" },
      { label: "Contact", href: "/contact" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-[#0B1513] text-white pt-[clamp(40px,6vw,72px)] pb-7">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-[clamp(24px,4vw,56px)] pb-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-[10px] mb-[14px]">
              <Image src="/logo-circle-white.webp" alt="CoworKing Café" width={36} height={36} className="shrink-0" />
              <span className="font-serif text-[18px]">CoworKing Café</span>
            </div>
            <address className="not-italic text-[13px] opacity-65 leading-[1.55]">
              1 rue de la Division Leclerc<br />
              67000 Strasbourg<br />
              Lun-Ven 9h-20h · Sam-Dim 10h-20h<br />
              +33 9 87 33 45 19
            </address>
          </div>

          {/* Columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--btn)] mb-[14px]">
                {col.title}
              </div>
              <ul className="flex flex-col gap-2 list-none p-0 m-0 text-[13px] opacity-70">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white no-underline hover:opacity-100 hover:text-[var(--btn)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between items-center gap-[10px] pt-5 border-t border-[rgba(255,255,255,0.08)] font-mono text-[10.5px] tracking-[0.1em] opacity-50">
          <span>&#169; 2026 COWORKING CAFE · TOUS DROITS RESERVES</span>
          <span>LE CAFE MOTIVE · L&apos;HUMAIN RELIE</span>
        </div>
      </div>
    </footer>
  );
}
