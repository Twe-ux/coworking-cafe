export interface Plan {
  key: "hourly" | "daily" | "monthly";
  label: string;
  price: number;
  unit: string;
  desc: string;
  features: string[];
  popular: boolean;
}

export interface Room {
  name: string;
  price: number;
  cap: string;
  color: string;
  href: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export const PLANS: Plan[] = [
  {
    key: "hourly",
    label: "À l'heure",
    price: 9,
    unit: "/h",
    desc: "Sans engagement. Payez ce que vous utilisez.",
    features: [
      "Open-space en libre accès",
      "Boissons illimitées",
      "Wi-Fi fibre 1 Gb/s",
      "Casier la journée",
    ],
    popular: false,
  },
  {
    key: "daily",
    label: "Journée",
    price: 24,
    unit: "/jour",
    desc: "9h → 19h, accès complet.",
    features: [
      "Tout « À l'heure »",
      "Imprimante A3",
      "Place garantie",
      "-15% après 5 journées/mois",
    ],
    popular: true,
  },
  {
    key: "monthly",
    label: "Mois",
    price: 179,
    unit: "/mois",
    desc: "Pour ceux qui y vivent presque.",
    features: [
      "Accès illimité open-space",
      "Casier permanent",
      "-40% sur les salles",
      "2 événements inclus",
    ],
    popular: false,
  },
];

export const ROOMS: Room[] = [
  { name: "Salle Verrière", price: 24, cap: "6 pers.", color: "#5A938B", href: "/espaces#verriere" },
  { name: "Salle Étage", price: 30, cap: "10 pers.", color: "#8A6B1F", href: "/espaces#etage" },
  { name: "Événementiel", price: 80, cap: "40 pers.", color: "#C0534C", href: "/espaces#event" },
];

export const FAQ: FaqItem[] = [
  {
    q: "Y a-t-il un abonnement obligatoire ?",
    a: "Non. Vous pouvez venir 2h par mois comme 200h. On adapte à votre rythme.",
  },
  {
    q: "Les boissons sont vraiment illimitées ?",
    a: "Oui. Café, thé, matcha, chocolat, infusions — +40 boissons chaudes & froides, dans le prix.",
  },
  {
    q: "Puis-je réserver pour mon équipe ?",
    a: "Oui, on propose des forfaits équipes dès 5 personnes. Contactez-nous pour un devis.",
  },
  {
    q: "Annulation ?",
    a: "Gratuite jusqu'à 24h avant le créneau. Ensuite, une partie du montant est retenue.",
  },
];
