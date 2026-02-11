import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Conditions Générales d'Utilisation (CGU) | CoworKing Café Strasbourg",
  description:
    "Conditions générales d'utilisation de CoworKing Café by Anticafé Strasbourg. Réservations, annulations, règles d'utilisation de l'espace de coworking et tarifs.",
  keywords: [
    "cgu coworking strasbourg",
    "conditions générales strasbourg",
    "règlement coworking",
    "annulation réservation coworking",
    "tarifs coworking strasbourg",
    "conditions anticafé",
  ],
  openGraph: {
    title: "Conditions Générales d'Utilisation | CoworKing Café",
    description:
      "CGU de CoworKing Café Strasbourg : réservations, annulations, règles d'utilisation et tarifs de l'espace de coworking.",
    url: "https://coworkingcafe.fr/cgu",
    siteName: "CoworKing Café Strasbourg",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "CoworKing Café - CGU",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CGU | CoworKing Café Strasbourg",
    description:
      "Conditions générales d'utilisation de l'espace de coworking",
    images: ["/images/og-image.png"],
  },
  alternates: {
    canonical: "https://coworkingcafe.fr/cgu",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CGULayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
