export interface Professional {
  id: number;
  title: string;
  categories: string;
  subCategories?: string;
  imgSrc: string;
}

export const professionalData: Professional[] = [
  {
    id: 1,
    title: "L'open-space",
    categories: "Zones variées et confortables, jusqu'à 60 places.",
    subCategories: `Lors d’une privatisation le matin ou sur la journée
complète, les petits-déjeuners sont inclus, afin
d’accueillir vos participants dans de bonnes conditions
dès leur arrivée.
Des encas sucrés peuvent également être proposés
pour les pauses, favorisant la concentration et les
échanges informels.
Pour le déjeuner ou les moments plus conviviaux, nous
travaillons avec des prestataires partenaires et pouvons
proposer plusieurs formats selon vos besoins :
repas assis en trois temps (entrée, plat, dessert) ou
formules cocktail avec mignardises.
La vente d’alcool est possible uniquement dans le cadre
des repas, toujours dans un contexte professionnel.`,
    imgSrc: "/images/professional/location-espace-evenementiel-strasbourg.webp",
  },
  {
    id: 2,
    title: "La verrière",
    categories: "Un espace équipé pour vos événements pros",
    subCategories: `Au-delà de l’espace et des équipements, Cow-or-King
Café offre une atmosphère qui fait la différence.
Chaleureuse sans être informelle, professionnelle sans
être rigide, elle favorise naturellement les échanges, la
créativité et la cohésion d’équipe. Que ce soit pour un
temps de réflexion stratégique, une conférence
inspirante ou une journée de team building, vos
participants se sentent à l’aise, disponibles et
pleinement engagés. Ici, on travaille sérieusement…
dans un cadre où il fait vraiment bon être ensemble.`,

    imgSrc: "/images/professional/team-building-strasbourg.webp",
  },
  {
    id: 3,
    title: "La verrière",
    categories: `Boissons & restauration : des formules adaptées
à vos temps forts`,
    subCategories: `Lors d’une privatisation le matin ou sur la journée
complète, les petits-déjeuners sont inclus, afin
d’accueillir vos participants dans de bonnes conditions
dès leur arrivée.
Des encas sucrés peuvent également être proposés
pour les pauses, favorisant la concentration et les
échanges informels.
Pour le déjeuner ou les moments plus conviviaux, nous
travaillons avec des prestataires partenaires et pouvons
proposer plusieurs formats selon vos besoins :
repas assis en trois temps (entrée, plat, dessert) ou
formules cocktail avec mignardises.
La vente d’alcool est possible uniquement dans le cadre
des repas, toujours dans un contexte professionnel.`,

    imgSrc: "/images/professional/team-building-strasbourg.webp",
  },
  {
    id: 4,
    title: "La verrière",
    categories: `Une ambiance propice aux échanges et à la
concentration `,
    subCategories: `Au-delà de l’espace et des équipements, Cow-or-King
Café offre une atmosphère qui fait la différence.
Chaleureuse sans être informelle, professionnelle sans
être rigide, elle favorise naturellement les échanges, la
créativité et la cohésion d’équipe. Que ce soit pour un
temps de réflexion stratégique, une conférence
inspirante ou une journée de team building, vos
participants se sentent à l’aise, disponibles et
pleinement engagés. Ici, on travaille sérieusement…
dans un cadre où il fait vraiment bon être ensemble.`,

    imgSrc: "/images/professional/coworking-evenement-strasbourg-anticafe.webp",
  },
];
