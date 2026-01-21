import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Politique de Confidentialité | CoworKing Café by Anticafé - Strasbourg",
  description:
    "Politique de confidentialité et protection des données personnelles conforme RGPD. Découvrez vos droits et comment nous protégeons vos données.",
  keywords:
    "confidentialité, RGPD, données personnelles, protection, coworking, strasbourg",
};

export default function ConfidentialityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
