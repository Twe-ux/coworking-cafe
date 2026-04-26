export interface Evenement {
  day: string;
  dayName: string;
  month: string;
  title: string;
  desc: string;
  tag: string;
  color: string;
  time: string;
  spots: string;
}

export const EVENEMENTS: Evenement[] = [
  {
    day: "24",
    dayName: "MER",
    month: "AVR",
    title: "Apéro du café · Avril",
    desc: "Rencontres informelles, bières locales et snacks maison. Ouvert à tous les membres.",
    tag: "Communauté",
    color: "#417972",
    time: "18h30 → 21h",
    spots: "32/50",
  },
  {
    day: "06",
    dayName: "LUN",
    month: "MAI",
    title: "Atelier · Freelance & impôts",
    desc: "Intervention d'un expert-comptable. 90 min + Q&A. Places limitées.",
    tag: "Atelier",
    color: "#8A6B1F",
    time: "19h → 21h",
    spots: "12/20",
  },
  {
    day: "15",
    dayName: "MER",
    month: "MAI",
    title: "Coffee cupping",
    desc: "Dégustation comparative de 4 origines. Animée par Julien, notre barista.",
    tag: "Dégustation",
    color: "#5A938B",
    time: "10h → 11h30",
    spots: "6/10",
  },
  {
    day: "28",
    dayName: "JEU",
    month: "MAI",
    title: "Nuit du coworking",
    desc: "Soirée ouverte jusqu'à minuit. Bières, pizzas, billard et bonne musique.",
    tag: "Soirée",
    color: "#C0534C",
    time: "19h → 00h",
    spots: "58/120",
  },
];
