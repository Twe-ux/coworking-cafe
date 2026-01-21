export interface Concept {
  id: number;
  title: string;
  description: string;
}

export const conceptData: Concept[] = [
  {
    id: 1,
    title: "À votre arrivée : on lance le timer",
    description: `Dès que vous entrez, vous nous donnez votre prénom (et votre
nom si vous êtes membre). On lance votre chrono et… c’est parti.
Note simple et transparente : la première heure entamée est due.
Même si vous restez 40 minutes, le tarif sera de 6 €.`,
  },
  {
    id: 2,
    title: "Installez-vous et connectez-vous",
    description: `Open-space lumineux, mange-debout pour bosser debout,
salons cosy, cabanes pour se concentrer, tables grandes ou
petites… choisissez votre spot du jour.
Vous vous connectez au Wi-Fi et vous pouvez démarrer votre
session avec le mood “productive & comfy”
.`,
  },
  {
    id: 3,
    title: "Commandez vos boissons et profitez",
    description: `Besoin d’un café, d’un matcha, d’une infusion ou d’une boisson
fraîche ? Passez au comptoir : une large sélection de boissons est
incluse et à volonté. Des snacks sucrés sont également
disponibles (inclus dans les forfaits jour, semaine et mois).
Ici, vous bossez… mais vous vous régalez aussi.`,
  },
  {
    id: 4,
    title: "À votre départ : on stoppe le chrono",
    description: `Votre session touche à sa fin ? Passez au comptoir, redonnez
votre prénom et on arrête votre timer.
⏱ Le calcul est simple : 6 €/h (par exemple : 1h50 = 11 €).
Et si vous dépassez 4h45, on bascule automatiquement sur le forfait
journée à 29 € : vous pouvez rester autant que vous voulez, ou même
revenir plus tard dans la journée sans frais supplémentaires.`,
  },
];
