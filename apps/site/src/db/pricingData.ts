export interface PricingPlan {
  space?: string;
  title: string;
  priceTTC: string;
  priceHT: string;
  duration: string;
  features: string[];
  condition: string;
}

export const pricingDataOpenSpace: PricingPlan[] = [
  {
    title: "Forfait",
    priceTTC: "6€",
    priceHT: "5,45€",
    duration: "par heure",
    features: [
      "accès à l’open-space",
      "wifi très haut débit",
      "boissons à volonté",
      "imprimante/scanner",
      "casiers à disposition",
    ],
    condition: `1ère heure entamée est due; après
        la 1ère heure, le tarif se calcule au
        prorata.`,
  },
  {
    title: "Forfait",
    priceTTC: "29€",
    priceHT: "24,17€",
    duration: "par jour",
    features: [
      "accès à l’open-space",
      "wifi très haut débit",
      "boissons à volonté",
      "encas inclus",
      `imprimante/scanner`,
      "casiers à disposition",
    ],
    condition: "S’enclenche à partir de 4h50. ",
  },
  {
    title: "Abonnement",
    priceTTC: "99€",
    priceHT: "82,50€",
    duration: "par semaine",
    features: [
      "accès à l’open-space",
      "wifi très haut débit",
      "boissons à volonté",
      "encas inclus",
      `imprimante/scanner`,
      "casiers à disposition",
      "programme membre",
    ],
    condition: "Valable sur 7 jours glissants.",
  },
  {
    title: "Abonnement",
    priceTTC: "290€",
    priceHT: "241,67€",
    duration: "par mois",
    features: [
      "accès à l’open-space",
      "wifi très haut débit",
      "boissons à volonté",
      "encas inclus",
      `imprimante/scanner`,
      "casiers à disposition",
      "programme membre",
    ],
    condition: "Valable sur 30 jours glissants.",
  },
];

// Legacy export for old components
export const pricingData = pricingDataOpenSpace;

export const pricingDataMeetingRoom: PricingPlan[] = [
  {
    space: "Verrière",
    title: "À partir de",
    priceTTC: "24€",
    priceHT: "20€",
    duration: "par heure",
    features: [
      "petite salle de réunion",
      `capacité : 4 personnes (+1 avec un supplément tarifaire)`,
      "wifi très haut débit",
      "boissons à volonté",
      "écran lcd pour projeter",
      "paperboard",
    ],
    condition: `1ère heure entammée est due ; après
la 1ère heure, le tarif se calcule au
prorata.`,
  },
  {
    space: "Verrière",
    title: "À partir de",
    priceTTC: "120€",
    priceHT: "100€",
    duration: "par jour",
    features: [
      "petite salle de réunion",
      `capacité : 4 personnes
      (+1 avec un supplément tarifaire)`,
      "wifi très haut débit",
      "boissons à volonté",
      "écran lcd pour projeter",
      "paperboard",
    ],
    condition: "",
  },
  {
    space: "Étage",
    title: "À partir de",
    priceTTC: "60€",
    priceHT: "50€",
    duration: "par heure",
    features: [
      "salle de réunion + salon d’accueil",
      `capacité : 10 personnes
      (+5 avec un supplément tarifaire)`,
      "wifi très haut débit",
      "boissons à volonté",
      "vidéoprojecteur et système son",
      "paperboard et whiteboard",
    ],
    condition: "",
  },
  {
    space: "Étage",
    title: "À partir de",
    priceTTC: "300€",
    priceHT: "250€",
    duration: "par jour",
    features: [
      "salle de réunion + salon d’accueil",
      `capacité : 10 personnes
      (+5 avec un supplément tarifaire)`,
      "wifi très haut débit",
      "boissons à volonté",
      "vidéoprojecteur et système son",
      "paperboard et whiteboard",
    ],
    condition: "",
  },
];
