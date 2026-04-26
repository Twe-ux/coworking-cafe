import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Notre concept — CoworKing Café Strasbourg",
  description:
    "Fondé en 2022, CoworKing Café réunit concentration, chaleur humaine et café spécialité. 420+ membres, 4 espaces, une communauté active à Strasbourg.",
  openGraph: {
    title: "Notre concept — CoworKing Café Strasbourg",
    description:
      "Né d'une frustration en 2022 : un lieu où l'on paie son temps, pas ses cafés. Fibre 1Gb/s, équipement pro, communauté.",
  },
};

const PILIERS = [
  { n: "01", title: "Payez au temps", desc: "Pas d'abonnement imposé. Entrez, travaillez, servez-vous un café, et ne payez que les heures passées chez nous." },
  { n: "02", title: "Travaillez sérieusement", desc: "Fibre 1Gb/s, salles insonorisées, équipement pro. Un vrai bureau, sans les contraintes du bail commercial." },
  { n: "03", title: "Rencontrez-vous", desc: "Un lieu où les indépendants, étudiants et équipes se croisent. Événements mensuels, apéros, sessions d'échange." },
];

const TIMELINE = [
  ["2022", "Ouverture rue de la Division Leclerc"],
  ["2023", "Inauguration de la Salle Verrière"],
  ["2024", "Privatisation de l'étage & événementiel"],
] as const;

const TEAM = [
  { n: "Thomas Meyer", r: "Co-fondateur · Ops", i: "TM", c: "#417972" },
  { n: "Clara Bauer", r: "Co-fondatrice · Community", i: "CB", c: "#5A938B" },
  { n: "Julien Roth", r: "Barista · Café spécialité", i: "JR", c: "#8A6B1F" },
  { n: "Sarah Klein", r: "Events & partenariats", i: "SK", c: "#C0534C" },
];

const PRIVATISATION_FEATURES: { icon: IconName; title: string; desc: string }[] = [
  { icon: "people", title: "40 personnes", desc: "Capacité max assise/debout" },
  { icon: "clock", title: "19h → 02h", desc: "Créneau soirée standard" },
  { icon: "tag", title: "dès 80€/h", desc: "Privatisation totale" },
  { icon: "sparkle", title: "Sono + lumières", desc: "Équipement inclus" },
];

export default function ConceptPage() {
  return (
    <>
      {/* Manifesto hero */}
      <section className="hero-dark">
        <div className="wrap text-center" style={{ position: "relative", zIndex: 1 }}>
          <div className="eyebrow mb-4" style={{ color: "var(--btn)", letterSpacing: "0.2em" }}>
            — 02 · LE MANIFESTE —
          </div>
          <h1 className="h1 mx-auto" style={{ maxWidth: 1100 }}>
            Le café <em className="not-italic text-[var(--btn)]">motive</em>.<br />
            L&apos;humain <em className="not-italic text-[var(--btn)]">relie</em>.
          </h1>
          <p className="lead mx-auto mt-7" style={{ maxWidth: 620, color: "rgba(255,255,255,0.78)" }}>
            On a créé CoworKing Café pour réunir ce que le travail moderne sépare trop souvent : la concentration, la chaleur humaine, et le plaisir d&apos;un bon café.
          </p>
        </div>
      </section>

      {/* 3 Piliers */}
      <section className="section section-cream">
        <div className="wrap">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
            <div>
              <div className="eyebrow mb-3">— 01 · Les 3 piliers</div>
              <h2 className="h2">Notre <em className="accent">philosophie</em></h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PILIERS.map((p) => (
              <div key={p.n} className="rounded-[20px] border border-[var(--line)] bg-white p-[clamp(22px,3vw,36px)]">
                <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--main)]">PILIER {p.n}</span>
                <h3 className="h3 mt-[14px]">{p.title}</h3>
                <p className="text-[14.5px] text-[var(--gry)] leading-[1.6] mt-3">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Histoire */}
      <section className="section section-dark">
        <div className="wrap">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-[clamp(24px,4vw,64px)]">
            <div>
              <div className="eyebrow mb-3" style={{ color: "var(--btn)" }}>— 02 · Notre histoire</div>
              <h2 className="h2 text-white">
                Né d&apos;une <em className="not-italic text-[var(--btn)]">frustration</em>.
              </h2>
            </div>
            <div className="text-[16px] leading-[1.7] text-white/78 flex flex-col gap-4">
              <p>En 2022, Thomas et Clara — l&apos;un freelance, l&apos;autre salariée en télétravail — tournaient en rond dans les cafés de Strasbourg. Trop bruyant, Wi-Fi fragile, un café noir à siroter lentement pour avoir le droit de rester.</p>
              <p>L&apos;idée : créer un lieu où l&apos;on paie son temps, pas ses cafés. Où l&apos;équipement est pro, l&apos;ambiance chaleureuse, et où l&apos;on peut rester 8h sans culpabiliser.</p>
              <p>Trois ans plus tard, ce sont <strong className="text-[var(--btn)]">420+ membres actifs</strong>, quatre espaces, une communauté qui se retrouve chaque mercredi pour les apéros du café.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-[56px]">
            {TIMELINE.map(([year, txt]) => (
              <div key={year} className="card-glass p-[22px]">
                <div className="font-serif text-[38px] leading-none text-[var(--btn)]">{year}</div>
                <div className="text-[13px] text-white/80 mt-[10px]">{txt}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section className="section section-cream">
        <div className="wrap">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
            <div>
              <div className="eyebrow mb-3">— 03 · L&apos;équipe</div>
              <h2 className="h2">Derrière le <em className="accent">comptoir</em></h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TEAM.map((p) => (
              <div key={p.n} className="rounded-[20px] border border-[var(--line)] bg-white overflow-hidden">
                <div className="h-[200px] flex items-center justify-center font-serif text-[64px] text-white" style={{ background: p.c }}>
                  {p.i}
                </div>
                <div className="p-[18px]">
                  <div className="font-serif text-[19px]">{p.n}</div>
                  <div className="text-[12px] text-[var(--gry)] mt-1">{p.r}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
