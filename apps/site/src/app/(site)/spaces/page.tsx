import PageTitle from "../../../components/site/PageTitle";
import Spaces from "../../../components/site/spaces/spaces";
import { Metadata } from "next";
import { BreadcrumbSchema } from "../../../components/seo/BreadcrumbSchema";

export const metadata: Metadata = {
  title: "Espaces | CoworKing Café by Anticafé",
  description: `Découvrez nos espaces de travail à Strasbourg : open-space, verrière privatisable et salle de réunion à l'étage. Des ambiances adaptées au coworking, aux réunions et aux formations, avec boissons à volonté et équipements pros. Réservez facilement votre espace pour travailler, organiser un rendez-vous, une réunion d'équipe, un team building ou un atelier à l'Anticafé Strasbourg.`,
  openGraph: {
    title: "Espaces - CoworKing Café by Anticafé",
    description: "Découvrez nos espaces de travail à Strasbourg.",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "CoworKing Café - Nos Espaces",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og-image.png"],
  },
  alternates: {
    canonical: "https://coworkingcafe.fr/spaces",
  },
};

const SpacesPage = () => {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Accueil", url: "https://coworkingcafe.fr" },
        { name: "Nos Espaces", url: "https://coworkingcafe.fr/spaces" }
      ]} />
      <PageTitle title={"Espaces"} />
      <Spaces />
    </>
  );
};

export default SpacesPage;
