import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réserver un Espace | Cow-or-King Café Strasbourg",
  description:
    "Réservez votre place de coworking en ligne. Open-space, salle de réunion privée ou espace événementiel. Boissons illimitées incluses. Réservation instantanée.",
  keywords: [
    "réserver coworking strasbourg",
    "réservation espace travail",
    "booking coworking anticafé",
    "salle réunion strasbourg",
    "bureau coworking réservation",
    "espace événementiel strasbourg",
  ],
  openGraph: {
    title: "Réserver un Espace de Coworking | Cow-or-King Café",
    description:
      "Réservation en ligne - Open-space, salle de réunion ou événementiel. Boissons illimitées, WiFi rapide. Confirmation immédiate.",
    url: "https://coworkingcafe.fr/booking",
    type: "website",
    images: [
      {
        url: "/images/og-booking.webp",
        width: 1200,
        height: 630,
        alt: "Réserver un espace de coworking à Strasbourg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Réserver un Espace | Cow-or-King Café",
    description: "Réservation en ligne instantanée. Open-space, salles privées, événementiel.",
    images: ["/images/og-booking.webp"],
  },
  alternates: {
    canonical: "https://coworkingcafe.fr/booking",
  },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
