import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Promo | CoworKing Café Strasbourg",
  description:
    "Votre code promo exclusif pour CoworKing Café Strasbourg. Utilisez-le pour bénéficier de réductions sur vos réservations.",
  robots: {
    index: false, // Ne pas indexer les pages de codes promo individuels
    follow: true,
  },
};

export default function PromoTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
