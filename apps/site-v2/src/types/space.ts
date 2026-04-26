export interface Space {
  key: "open" | "verriere" | "etage" | "event";
  name: string;
  desc: string;
  price: number;
  color: string;
  emoji: string;
  href: string;
  tag: string;
  cap: string;
  details: string[];
}

export const SPACES: Space[] = [
  {
    key: "open",
    name: "Open-space",
    desc: "Postes de travail en mode bureau partagé. Ambiance studieuse, voisins bienveillants, café à portée de main. Idéal pour le télétravail au quotidien sans les distractions de la maison.",
    price: 9,
    color: "#417972",
    emoji: "🪴",
    href: "/espaces#open-space",
    tag: "Lieu de travail",
    cap: "Jusqu'à 20 pers.",
    details: [
      "Wi-Fi fibre 1 Gb/s",
      "Boissons illimitées",
      "Casier sécurisé",
      "Imprimante A3",
      "Ambiance studieuse",
    ],
  },
  {
    key: "verriere",
    name: "Salle Verrière",
    desc: "Salle baignée de lumière naturelle avec verrière traversante. Parfaite pour les réunions, ateliers et workshops jusqu'à 12 personnes. Équipée visio pro et tableau blanc.",
    price: 25,
    color: "#2F5955",
    emoji: "☀️",
    href: "/espaces#verriere",
    tag: "Réunion & ateliers",
    cap: "Jusqu'à 12 pers.",
    details: [
      "Lumière naturelle traversante",
      "Écran 55\" 4K",
      "Visio pro intégrée",
      "Tableau blanc",
      "Boissons illimitées",
    ],
  },
  {
    key: "etage",
    name: "Salle Étage",
    desc: "Espace privatif et calme à l'étage. Idéal pour les séances de focus, entretiens ou petites équipes nécessitant calme et concentration sans dérangement.",
    price: 18,
    color: "#5C6E6B",
    emoji: "🏔",
    href: "/espaces#etage",
    tag: "Focus & privatif",
    cap: "Jusqu'à 6 pers.",
    details: [
      "Privatisation totale",
      "Tableau blanc grand format",
      "Ambiance cosy",
      "Boissons incluses",
      "Café spécialité",
    ],
  },
  {
    key: "event",
    name: "Événementiel",
    desc: "Privatisation complète du lieu pour vos événements, soirées, formations ou lancements. Service traiteur disponible sur devis, sono et éclairage inclus.",
    price: 80,
    color: "#8A6B1F",
    emoji: "✨",
    href: "/espaces#event",
    tag: "Privatisation",
    cap: "Jusqu'à 80 pers.",
    details: [
      "Privatisation complète",
      "Sono + lumières",
      "Service traiteur possible",
      "Vestiaire",
      "Nettoyage inclus",
    ],
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Mon bureau de secours qui est devenu mon bureau principal. Le cappuccino est incroyable et le Wi-Fi toujours rapide.",
    name: "Léa Marchand",
    role: "Designer freelance · 2 ans membre",
  },
  {
    quote:
      "On privatise la salle Verrière pour nos workshops d'équipe une fois par mois. Toujours impeccable, toujours accueillant.",
    name: "Hugo Petit",
    role: "CEO · Studio Hélium",
  },
  {
    quote:
      "Le meilleur rapport qualité/prix du centre-ville. Les boissons à volonté, c'est un vrai plus pour les longues sessions.",
    name: "Anaïs Dubois",
    role: "Étudiante Master 2",
  },
];
