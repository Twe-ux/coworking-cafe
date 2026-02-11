import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité RGPD | CoworKing Café Strasbourg",
  description:
    "Politique de confidentialité et protection des données personnelles conforme RGPD de CoworKing Café Strasbourg. Transparence totale sur la collecte et le traitement de vos données.",
  keywords: [
    "politique confidentialité strasbourg",
    "rgpd coworking",
    "protection données personnelles",
    "confidentialité anticafé",
    "données rgpd strasbourg",
    "vie privée coworking",
  ],
  openGraph: {
    title: "Politique de Confidentialité RGPD | CoworKing Café",
    description:
      "Politique de confidentialité conforme RGPD. Protection totale de vos données personnelles chez CoworKing Café Strasbourg.",
    url: "https://coworkingcafe.fr/confidentiality",
    siteName: "CoworKing Café Strasbourg",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Politique de Confidentialité RGPD | CoworKing Café",
    description: "Protection totale de vos données personnelles - Conforme RGPD",
  },
  alternates: {
    canonical: "https://coworkingcafe.fr/confidentiality",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ConfidentialityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
