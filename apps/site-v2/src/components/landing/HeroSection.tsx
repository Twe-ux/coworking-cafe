import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const STATS = [
  {
    icon: "cookie" as const,
    label: "Boissons",
    value: "+40",
    sub: "à volonté, dans le prix",
    iconBg: "rgba(242,211,129,0.22)",
    iconColor: "var(--btn)",
  },
  {
    icon: "sparkle" as const,
    label: "Wi-Fi",
    value: "1 Gb/s",
    sub: "Fibre dédiée, VPN OK",
    iconBg: "color-mix(in srgb, var(--success) 22%, transparent)",
    iconColor: "var(--accent-green)",
  },
];

export function HeroSection() {
  return (
    <section className="hero-dark">
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[clamp(24px,4vw,56px)] items-end">
          {/* Left — copy */}
          <div>
            <span className="inline-flex items-center gap-[8px] px-[14px] py-[8px] rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-[12px] font-mono tracking-[0.12em] uppercase text-white/70">
              <span className="w-[6px] h-[6px] rounded-full bg-[var(--btn)] shrink-0" />
              Ouvert maintenant · Strasbourg
            </span>

            <h1 className="h1 mt-[22px] text-white">
              Travailler{" "}
              <em className="not-italic text-[var(--btn)]">mieux</em>,<br />
              un café à{" "}
              <em className="not-italic text-[var(--btn)]">la fois</em>.
            </h1>

            <p className="lead text-white/75 mt-[26px] max-w-[560px]">
              Espace de coworking chaleureux au cœur de Strasbourg. Boissons
              illimitées, Wi-Fi fibre, salles privatisables. Pas d&apos;abonnement
              imposé — payez seulement le temps que vous restez.
            </p>

            <div className="flex flex-wrap gap-[12px] mt-[36px]">
              <Link href="/booking">
                <Button variant="primary" size="md">
                  Réserver en ligne
                  <Icon name="chevRight" size={15} stroke="var(--body)" sw={2.2} />
                </Button>
              </Link>
              <Link href="/espaces">
                <Button variant="ghost-light" size="md">
                  <Icon name="building" size={15} stroke="var(--btn)" />
                  Découvrir le lieu
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — stat cards */}
          <div className="flex flex-col gap-[12px] lg:flex-col flex-row overflow-x-auto">
            {STATS.map((s) => (
              <div key={s.label} className="card-glass shrink-0 min-w-[220px]">
                <div className="flex items-center gap-[10px] mb-[10px]">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: s.iconBg }}
                  >
                    <Icon name={s.icon} size={17} stroke={s.iconColor} />
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-white/60">
                    {s.label}
                  </span>
                </div>
                <div className="font-serif text-[30px] leading-none text-white">
                  {s.value}
                </div>
                <div className="text-[12px] text-white/70 mt-[4px]">{s.sub}</div>
              </div>
            ))}

            {/* Rating card */}
            <div className="card-btn shrink-0 min-w-[220px]">
              <div className="flex items-center gap-[10px] mb-[10px]">
                <Icon name="star" size={16} stroke="var(--body)" fill="var(--body)" />
                <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--body)]/65">
                  Google
                </span>
              </div>
              <div className="font-serif text-[30px] leading-none text-[var(--body)]">
                4.9<span className="text-[15px] opacity-60">/5</span>
              </div>
              <div className="text-[12px] text-[var(--body)]/75 mt-[4px]">280 avis clients</div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="flex flex-wrap justify-between items-center gap-4 mt-[60px] pt-[24px] border-t border-white/10">
          <div className="marquee">
            <span>✦ Télétravailleurs</span>
            <span>✦ Indépendants</span>
            <span>✦ Étudiants</span>
            <span>✦ Équipes</span>
            <span>✦ Événements privés</span>
          </div>
          <span className="font-mono text-[11px] text-white/60 tracking-[0.1em]">
            ↓ SCROLL
          </span>
        </div>
      </div>
    </section>
  );
}
