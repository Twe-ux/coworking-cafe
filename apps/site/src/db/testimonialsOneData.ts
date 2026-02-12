export interface TestimonialOne {
  stars: number;
  review: string;
  reviewer: {
    name: string;
    position: string;
    image: string;
  };
  quoteImage: string;
}

export const testimonialsOneData: TestimonialOne[] = [
  {
    stars: 5,
    review:
      "Un café incroyable pour le rapport qualité-prix. Les gérants sont très professionnels. Si vous ne savez pas quoi faire à Strasbourg pour attendre votre train ou pour travailler dans le calme avec un large matériel à disposition (prises + wifi + boissons à volonté pour les classiques), voici l'endroit idéal. Merci pour ce moment.",
    reviewer: {
      name: "Sacha Z*c*r*p**l*s",
      position: "Il y a 12 semaines",
      image: "/images/testimonail/1.webp",
    },
    quoteImage: "/images/testimonail/quotes1.svg",
  },
  {
    stars: 5,
    review: `A nice co-working cafe !
€6 per hour, plus 10 cents per minute.
Cold drinks and hot drinks are free.
Friendly staffs, cool guests, stable WiFi, calm vibe, and great cold brew coffee which I personally enjoyed the most! ☕️
`,
    reviewer: {
      name: "Wendy Ch*n",
      position: "Il y a 18 semaines",
      image: "/images/testimonail/3.webp",
    },
    quoteImage: "/images/testimonail/quotes1.svg",
  },
  {
    stars: 5,
    review: `Avec mon collègue, j'ai l'habitude d'y aller pour travailler sur nos projets. Le service, et l'ambiance sont toujours très agréables, et le personnel est chaleureux et humain. Je recommande vivement pour ceux et celles qui veulent travailler, que ce soit pour les études, les projets personnels et autre, dans un espace calme avec des boissons de qualité 👌`,
    reviewer: {
      name: "William D**NG",
      position: "Il y a 18 semaines",
      image: "/images/testimonail/2.webp",
    },
    quoteImage: "/images/testimonail/quotes1.svg",
  },
  {
    stars: 5,
    review: `Un lieu cosy avec plein d'espérances différents. Un concept novateur pour tous les travailleurs indépendants avec la juste dose de sourires et de concentration. Un accueil super chaleureux et des boissons savoureuses.
Mon nouveau spot pour travailler quand je suis à Strasbourg ✨
`,
    reviewer: {
      name: "Miriam B*ld*ll*",
      position: "Il y a 20 semaines",
      image: "/images/testimonail/5.webp",
    },
    quoteImage: "/images/testimonail/quotes1.svg",
  },
  {
    stars: 5,
    review:
      "Lieu sympa, décoration inspirante et ambiance propice pour un travail fructueux ! Concept original !",
    reviewer: {
      name: "Jonas P*L*T",
      position: "Il y a 29 semaines",
      image: "/images/testimonail/4.webp",
    },
    quoteImage: "/images/testimonail/quotes1.svg",
  },
  {
    stars: 5,
    review:
      "Environnement sonore doux et agréable, mobilier sympathique et des boissons absolument délicieuses. J'aime bien y aller quand j'ai besoin d'être bien concentré et avec un bon café frappé pour se donner du courage.",
    reviewer: {
      name: "Morgan",
      position: "Il y a 41 semaines",
      image: "/images/testimonail/2.webp",
    },
    quoteImage: "/images/testimonail/quotes1.svg",
  },
  {
    stars: 5,
    review: `Super café, personnel agréable et le café est bon.
Concept super intéressant et la salle est parfaite (vraiment parfait pour travailler ou discuter).
Je recommande vivement
`,
    reviewer: {
      name: "Niels T**L**SE",
      position: "Il y a 44 semaines",
      image: "/images/testimonail/4.webp",
    },
    quoteImage: "/images/testimonail/quotes1.svg",
  },
  {
    stars: 5,
    review:
      "Super café, le personnel est très serviable et les boisson sympathique. Le concept est original et ingénieux. Des boissons originales et uniques sont aussi disponibles. Je recommande.",
    reviewer: {
      name: "O M",
      position: "Il y a 46 semaines",
      image: "/images/testimonail/2.webp",
    },
    quoteImage: "/images/testimonail/quotes1.svg",
  },
  {
    stars: 5,
    review: `C'est calme et idéal pour bosser sur son PC et le personnel est au top du sourire :)`,
    reviewer: {
      name: "Annaëlle Baechtel",
      position: "17 août 2024",
      image: "/images/testimonail/1.webp",
    },
    quoteImage: "/images/testimonail/quotes1.svg",
  },
];
