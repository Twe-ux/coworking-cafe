export interface ProjectOne {
  id: number;
  title: string;
  link: string;
  categories: string;
  subCategories?: string;
  imgSrc: string;
  imgSrc2?: string;
}

export const projectsOneData: ProjectOne[] = [
  {
    id: 1,
    title: "L'open-space",
    link: "open-space",
    categories: "Zones variées et confortables, jusqu'à 60 places.",
    subCategories:
      "Venez directement ou réservez en avance, nous aurons toujours un espace et un sourire pour vous accueillir.",
    imgSrc: "/images/projects/espaces-coworking-strasbourg.webp",
    imgSrc2: "/images/projects/openspace-coworking-strasbourg-bis.webp",
  },

  {
    id: 2,
    title: "La verrière",
    link: "verriere",
    categories: "Petite salle de réunion équipée jusqu'à 4/5 personnes.",
    imgSrc: "/images/projects/salle-réunion-verrière-strasbourg.webp",
  },
  {
    id: 3,
    title: "L'étage",
    link: "etage",
    categories: "Salle de réunion équipée (10 à 15 personnes).",
    imgSrc: "/images/projects/salle-réunion-étage-strasbourg.webp",
  },
];
