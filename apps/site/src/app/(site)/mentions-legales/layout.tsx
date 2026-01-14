import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales | CoworKing Café by Anticafé - Coworking Strasbourg",
  description:
    "Mentions légales du CoworKing Café by Anticafé - Espace de CoworKing Café by Anticafé à Strasbourg. Informations sur l'éditeur, l'hébergeur et les conditions d'utilisation.",
  robots: "index, follow",
};

export default function MentionsLegalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
