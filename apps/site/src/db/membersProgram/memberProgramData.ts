export interface membersProgram {
  id: number;
  title: string;
  description: string;
  icon: string;
  underDescription: string;
  delay: number;
}

export const membersProgramData: membersProgram[] = [
  {
    id: 1,
    title: "Vous venez à CoworKing Café by Anticafé",
    description: `Passez la porte, donnez votre nom,
installez-vous... Que ce soit pour
travailler, étudier, chiller ou grignoter…
chaque passage compte.`,
    icon: "👋",
    underDescription: "* Compte membre nominatif",
    delay: 100,
  },
  {
    id: 2,
    title: "Vous cumulez des points",
    description: `Chaque euro dépensé compte. Ça
monte vite… parfois sans même que
vous vous en rendiez compte.`,
    icon: "★",
    underDescription: "* 1€ dépensé = 10 points gagnés",
    delay: 200,
  },
  {
    id: 3,
    title: "Vous gagnez vos récompenses",
    description: `Heures gratuites, journées, semaines,
pizzas, gourmandises, goodies… À vous
de choisir ce que vous voulez vous offrir.`,
    icon: "🎁",
    underDescription: "* Vos points = vos cadeaux",
    delay: 300,
  },
];
