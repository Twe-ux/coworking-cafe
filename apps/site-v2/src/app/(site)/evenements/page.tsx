import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { EventCard } from "@/components/evenements/EventCard";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { IconName } from "@/components/ui/Icon";
import { EVENEMENTS } from "@/types/evenement";

export const metadata: Metadata = {
  title: "Événements — CoworKing Café Strasbourg",
  description:
    "Ateliers, dégustations, apéros et soirées à Strasbourg. Rejoignez la communauté CoworKing Café ou privatisez le lieu pour vos événements.",
  openGraph: {
    title: "Événements — CoworKing Café Strasbourg",
    description:
      "Apéros mensuels, ateliers professionnels, dégustations café. Ou privatisez le lieu pour vos soirées d'entreprise.",
  },
};

const PRIVATISATION_FEATURES: { icon: IconName; title: string; desc: string }[] = [
  { icon: "people", title: "40 personnes", desc: "Capacité max assise/debout" },
  { icon: "clock", title: "19h → 02h", desc: "Créneau soirée standard" },
  { icon: "tag", title: "dès 80€/h", desc: "Privatisation totale" },
  { icon: "sparkle", title: "Sono + lumières", desc: "Équipement inclus" },
];

export default function EvenementsPage() {
  return (
    <>
      <PageHeader
        num="05"
        eyebrow="Événements"
        title="Le café vit,"
        titleAccent="aussi le soir."
        lead="Ateliers, dégustations, apéros, soirées privées. Notre lieu se transforme pour rassembler la communauté — ou accueillir vos propres événements."
      />

      {/* Calendar */}
      <section className="section section-cream">
        <div className="wrap">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
            <div>
              <div className="eyebrow mb-3">— À venir</div>
              <h2 className="h2">
                Prochains <em className="accent">rendez-vous</em>
              </h2>
            </div>
            <div className="flex gap-[10px]">
              <Button variant="ghost" size="sm">
                <Icon name="chevLeft" size={14} />
                Avril
              </Button>
              <Button variant="ghost" size="sm">
                Mai
                <Icon name="chevRight" size={14} />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-[14px]">
            {EVENEMENTS.map((e) => (
              <EventCard key={`${e.day}-${e.month}`} event={e} />
            ))}
          </div>
        </div>
      </section>

      {/* Privatisation */}
      <section className="section section-dark">
        <div className="wrap">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-[clamp(24px,4vw,60px)] items-center">
            <div>
              <div className="eyebrow mb-3" style={{ color: "var(--btn)" }}>
                — Privatisation
              </div>
              <h2 className="h2 text-white">
                Votre soirée,{" "}
                <em className="not-italic text-[var(--btn)]">notre lieu.</em>
              </h2>
              <p className="lead mt-[22px]" style={{ color: "rgba(255,255,255,0.75)" }}>
                Anniversaires, lancements produit, soirées d&apos;entreprise, afterwork. On ferme les portes au public, on installe votre setup, on s&apos;occupe du reste.
              </p>
              <div className="flex flex-wrap gap-[12px] mt-[30px]">
                <Link href="/contact">
                  <Button variant="primary" size="md">
                    Demander un devis
                    <Icon name="chevRight" size={14} stroke="#1A1A1A" sw={2.2} />
                  </Button>
                </Link>
                <Button variant="ghost-light" size="md">
                  Télécharger la brochure
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[12px]">
              {PRIVATISATION_FEATURES.map((f) => (
                <div key={f.title} className="card-glass">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-[14px]"
                    style={{ background: "rgba(242,211,129,0.18)" }}
                  >
                    <Icon name={f.icon} size={17} stroke="var(--btn)" />
                  </div>
                  <div className="font-serif text-[22px] text-white">{f.title}</div>
                  <div className="text-[12.5px] text-white/70 mt-1">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
