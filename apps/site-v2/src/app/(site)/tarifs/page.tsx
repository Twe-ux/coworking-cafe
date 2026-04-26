import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PricingPlans } from "@/components/tarifs/PricingPlans";
import { RoomsTable } from "@/components/tarifs/RoomsTable";
import { FaqSection } from "@/components/tarifs/FaqSection";

export const metadata: Metadata = {
  title: "Tarifs — CoworKing Café Strasbourg",
  description:
    "Coworking à Strasbourg dès 9€/h. Formules à l'heure, à la journée ou au mois. Boissons illimitées incluses. Pas d'abonnement imposé.",
  openGraph: {
    title: "Tarifs — CoworKing Café Strasbourg",
    description:
      "Dès 9€/h, boissons illimitées incluses. Formules flexibles sans engagement. Salles privatisables à la demande.",
  },
};

export default function TarifsPage() {
  return (
    <>
      <PageHeader
        num="03"
        eyebrow="Tarifs"
        title="Simple,"
        titleAccent="transparent."
        lead="Pas de frais cachés, pas d'engagement imposé. Vous payez ce que vous utilisez — et si vous y passez beaucoup de temps, on vous récompense."
      />
      <PricingPlans />
      <RoomsTable />
      <FaqSection />
    </>
  );
}
