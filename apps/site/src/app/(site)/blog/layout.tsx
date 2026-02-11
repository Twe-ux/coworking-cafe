import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Mag' | CoworKing Café Strasbourg",
  description: "Découvrez nos conseils, actualités et astuces sur le coworking à Strasbourg. Articles sur la productivité, le télétravail, et la vie de freelance.",
  keywords: [
    "blog coworking",
    "coworking strasbourg",
    "anticafé blog",
    "conseils télétravail",
    "productivité freelance",
  ],
  openGraph: {
    title: "Le Mag' - Blog CoworKing Café",
    description: "Conseils et actualités coworking à Strasbourg",
    url: "https://coworkingcafe.fr/blog",
    siteName: "CoworKing Café Strasbourg",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Le Mag' - Blog CoworKing Café",
    description: "Conseils et actualités coworking à Strasbourg",
  },
  alternates: {
    canonical: "https://coworkingcafe.fr/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
