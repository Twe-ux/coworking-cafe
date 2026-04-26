import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { SpacesSection } from "@/components/landing/SpacesSection";
import { ConceptSection } from "@/components/landing/ConceptSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";

export const metadata: Metadata = {
  title: "CoworKing Café Strasbourg — Coworking + Café",
  description:
    "Espace de coworking chaleureux au cœur de Strasbourg. Boissons illimitées, Wi-Fi fibre, salles de réunion privatisables. Dès 9€/h. Ouvert 7j/7, 9h-20h.",
  openGraph: {
    title: "CoworKing Café Strasbourg — Coworking + Café",
    description:
      "Espace de coworking chaleureux au cœur de Strasbourg. Pas d'abonnement imposé — payez seulement le temps que vous restez.",
  },
};

export default function HomePage() {
  return (
    <>
      <LocalBusinessSchema />
      <HeroSection />
      <SpacesSection />
      <ConceptSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
