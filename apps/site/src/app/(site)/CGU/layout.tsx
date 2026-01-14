import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Conditions Générales d'Utilisation | CoworKing Café by Anticafé - CoworKing Strasbourg",
  description:
    "Consultez les conditions générales d'utilisation de notre espace de CoworKing Café by Anticafé à Strasbourg. Règles d'utilisation, réservations et annulations.",
  robots: "index, follow",
};

export default function CGULayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
