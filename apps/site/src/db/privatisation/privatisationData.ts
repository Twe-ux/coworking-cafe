export interface Privatisation {
  id: number;
  title: string;
  categories: string;
  subCategories?: string;
  imgSrc: string;
}

export const privatisationData: Privatisation[] = [
  {
    id: 1,
    title: "salle de réunion privatisable",
    categories: "Zones variées et confortables, jusqu'à 50 places.",
    subCategories: `En privatisant Coworking Café, vous bénéficiez de
                    l’ensemble de l’établissement, sans cohabitation avec
                    d’autres publics.
                    Selon le format choisi, le lieu peut accueillir entre 40 et
                    60 personnes, avec différentes configurations possibles
                    : présentations, échanges en petits groupes,
                    conférences, ateliers ou moments plus informels.
                    L’espace se prête aussi bien à des temps de travail
                    structurés qu’à des moments de respiration, de
                    networking ou de convivialité.
                    La privatisation vous offre une liberté totale
                    d’organisation : circulation fluide, prises de parole,
                    musique d’ambiance, utilisation de micros et de
                    supports de présentation sont possibles.
                    Seule limite volontaire : nous ne proposons pas de
                    soirées festives tardives à ambiance musicale, afin de
                    préserver l’ADN du lieu.`,
    imgSrc: "/images/professional/location-espace-evenementiel-strasbourg.webp",
  },
  {
    id: 3,
    title: "buffet traiteur pour vos événements",
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

    imgSrc: "/images/professional/traiteur-privatisation-coworkingcafe.webp",
  },
  {
    id: 2,
    title: "salle conférence privatisable",
    categories: "Un espace équipé pour vos événements pros",
    subCategories: `Parce qu’un événement professionnel doit être fluide et
  sans imprévu technique, notre espace est déjà équipé
  pour répondre aux besoins des organisateurs comme
  des participants.
  Vous bénéficiez notamment d’un wifi très haut débit,
  indispensable pour les formations, les conférences et
  les événements hybrides.
  Des écrans, un vidéoprojecteur, des whiteboards et des
  paperboards sont disponibles pour faciliter les
  présentations, les échanges et les sessions de travail
  collaboratif.
  Le mobilier est modulable et peut être adapté en
  fonction de votre format.
  Notre équipe est présente sur place pour l’accueil et le
  bon déroulement de votre événement, dans un esprit
  professionnel mais détendu`,

    imgSrc: "/images/professional/team-building-strasbourg.webp",
  },

  {
    id: 4,
    title: "lieu modulable pour vos événements",
    categories: `Une ambiance propice aux échanges et à la
concentration `,
    subCategories: `Au-delà de l’espace et des équipements, CoworKing
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
