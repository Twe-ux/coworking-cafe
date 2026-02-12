interface FAQ {
  question: string;
  answer: string;
}

interface FAQPageSchemaProps {
  faqs: FAQ[];
}

export function FAQPageSchema({ faqs }: FAQPageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Real FAQ data for /pricing page
export const pricingFAQs: FAQ[] = [
  {
    question: "Comment fonctionne la tarification au CoworKing Café ?",
    answer:
      "Vous payez au temps passé. La 1ère heure est facturée en entier (6 €), puis au prorata. À partir de 4h50, le tarif bascule automatiquement au forfait journée (29 €). Vous pouvez alors rester plus longtemps ou revenir le même jour sans supplément.",
  },
  {
    question: "Que comprennent les tarifs du coworking ?",
    answer:
      "Tous les tarifs incluent : l'accès à l'open-space, le WiFi très haut débit, les boissons chaudes et froides à volonté (plus de 40 boissons), l'imprimante/scanner et les casiers. Les forfaits journée, semaine et mois incluent également les encas et le programme membre fidélité.",
  },
  {
    question: "Existe-t-il des tarifs étudiants pour le coworking à Strasbourg ?",
    answer:
      "Oui ! Happy Hours étudiants : 12 € les 3 heures du lundi au vendredi de 17h à 20h (au lieu de 18 €). Happy Weekend étudiants : 24 € la journée le samedi, dimanche et jours fériés (au lieu de 29 €). Sur présentation d'une carte étudiante valide.",
  },
  {
    question: "Comment réserver une salle de réunion ?",
    answer:
      "Vous pouvez réserver en ligne sur notre site. La Verrière (4-5 personnes) est à 24 €/h ou 120 €/jour. L'Étage (10-15 personnes) est à 60 €/h ou 300 €/jour. Les deux salles incluent le WiFi, les boissons à volonté et l'équipement de projection.",
  },
  {
    question: "Peut-on privatiser le CoworKing Café ?",
    answer:
      "Oui, la privatisation de l'ensemble de l'établissement est possible. Pour obtenir un devis personnalisé, contactez-nous par email à strasbourg@coworkingcafe.fr.",
  },
];

// Real FAQ data for /concept page
export const conceptFAQs: FAQ[] = [
  {
    question: "Qu'est-ce que le concept Anticafé ?",
    answer:
      "Le concept Anticafé, né en 2013, est un modèle de café-coworking où l'on paie au temps passé et non à la consommation. Toutes les boissons (chaudes et froides), les encas, le WiFi et l'espace de travail sont inclus. C'est un tiers-lieu entre salon urbain, coworking convivial et cocon créatif.",
  },
  {
    question: "À qui s'adresse CoworKing Café by Anticafé ?",
    answer:
      "CoworKing Café accueille les freelances et indépendants cherchant un QG sans engagement, les étudiants souhaitant réviser efficacement, les télétravailleurs qui fuient le domicile, les voyageurs ayant besoin d'un espace fonctionnel, et les équipes qui veulent se retrouver hors du bureau.",
  },
  {
    question: "Quels sont les forfaits disponibles chez CoworKing Café ?",
    answer:
      "Nos forfaits s'adaptent à votre rythme : 6 €/heure pour une session focus, 29 €/journée pour travailler sans stress du chrono, 99 €/semaine pour les nomades en passage prolongé, et 290 €/mois pour un QG flexible en plein centre-ville de Strasbourg.",
  },
  {
    question: "Quelles boissons sont incluses dans le tarif ?",
    answer:
      "Plus de 40 boissons sont incluses : cafés, thés, chocolats chauds, boissons fraîches, jus... Toutes préparées à la demande et à volonté pendant toute la durée de votre session. Les encas sont également inclus à partir du forfait journée.",
  },
];
