import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { SpaceCard } from "@/components/espaces/SpaceCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SPACES } from "@/types/space";

export const metadata: Metadata = {
  title: "Nos espaces — CoworKing Café Strasbourg",
  description:
    "4 espaces de coworking à Strasbourg : open-space, Salle Verrière, Salle Étage et privatisation événementielle. Réservables à l'heure, à la journée ou au mois.",
  openGraph: {
    title: "Nos espaces — CoworKing Café Strasbourg",
    description:
      "Open-space, salle de réunion, espace focus et privatisation événementielle. Dès 9€/h, boissons illimitées incluses.",
  },
};

export default function EspacesPage() {
  return (
    <>
      <PageHeader
        num="01"
        eyebrow="Nos espaces"
        title="Quatre ambiances,"
        titleAccent="un seul état d'esprit."
        lead="Du deep-work en solo au brainstorm d'équipe, en passant par vos événements privés : chaque espace a été pensé pour un usage précis."
      />

      <section className="section section-cream">
        <div className="wrap flex flex-col gap-[clamp(20px,3vw,32px)]">
          {SPACES.map((space, i) => (
            <SpaceCard key={space.key} space={space} index={i} />
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="section-dark" style={{ padding: "clamp(40px, 6vw, 64px) 0" }}>
        <div className="wrap flex flex-wrap justify-between items-center gap-6">
          <div>
            <div className="eyebrow mb-3" style={{ color: "var(--btn)" }}>
              — Besoin d&apos;aide ?
            </div>
            <h2 className="h2 text-white">
              Une visite ?{" "}
              <em className="not-italic text-[var(--btn)]">On vous guide.</em>
            </h2>
          </div>
          <div className="flex flex-wrap gap-[12px]">
            <Link href="/contact">
              <Button variant="ghost-light" size="md">
                <Icon name="calendar" size={14} stroke="var(--btn)" />
                Prendre rendez-vous
              </Button>
            </Link>
            <Link href="/booking">
              <Button variant="primary" size="md">
                Réserver
                <Icon name="chevRight" size={14} stroke="#1A1A1A" sw={2.2} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
