export interface OffersStudentsDetailsProps {
  id: string;
  title: string;
  description: string;
  subDescription: string;
  img: string;
}

export const offersStudentsDetailsData: OffersStudentsDetailsProps[] = [
  {
    id: "happy-hours",
    title: "Happy Hours , 🎓 spécial étudiants",
    description:
      `Du lundi au vendredi, de 17h à 20h\n` +
      `Besoin d’un endroit pour réviser, bosser en groupe, avancer sur
tes projets ou simplement te concentrer en fin de journée ?
Nos Happy Hours Étudiants sont faites pour toi 💛
Pendant ce créneau, tu profites d’un tarif ultra avantageux :
👉 12 € les 3 heures (au lieu de 18 €)
✨ sur présentation d’une carte étudiante valide
Tu t’installes où tu veux, tu profites du wifi très haut débit, de
l’ambiance calme et studieuse, et de toutes nos boissons chaudes
et fraîches préparées à la demande. Tout est inclus — tu n’as qu’à
venir avec ton ordi et ta motivation.
C’est le moment parfait pour :
réviser sans distraction
bosser en équipe
finaliser un rendu ou un projet
rester productif sans exploser ton budget
t’offrir un vrai espace de focus avant la soirée 😎
Pas besoin de réserver : tu viens, tu donnes ton prénom, et on
lance ton timer. Facile, non ?`,
    subDescription:
      "Profite de nos Happy Hours Étudiants et transforme tes fins de journée en sessions de travail efficaces et agréables, le tout à petit prix !",

    img: "/images/offersStudents/offres-étudiants-happy-hours-coworking-strasbourg.webp",
  },
  {
    id: "happy-weekend",
    title: `Happy Weekend,
🎓 spécial étudiants`,
    description: `Tous les samedis, dimanches et jours fériés. 
Envie de bosser au calme le week-end, loin du bruit de la coloc ou
de la BU surchargée ?
Nos Happy Weekend Étudiants sont là pour te sauver la
productivité… et ton budget 💛
Pendant tout le week-end, tu profites d’un tarif spécial :
👉 24 € la journée (au lieu de 29 €)
✨ sur présentation d’une carte étudiante valide
Tu t’installes où tu veux, tu profites du wifi très haut débit, de nos
boissons à volonté (chaudes et fraîches, préparées à la
demande), et d’un espace cosy parfait pour réviser, avancer sur
un projet ou organiser une session de travail en groupe.
C’est le spot idéal pour :
préparer tes examens sans stress
avancer sur un mémoire ou un dossier
travailler avec ta team
t’offrir une vraie journée productive hors de chez toi
retrouver un peu d’air et de motivation
Pas de réservation nécessaire : tu arrives, tu montres ta carte
étudiante, et tu peux profiter de ton espace toute la journée 😎`,
    subDescription:
      "Profite de nos Happy Weekend Étudiants pour allier productivité et détente, tout en respectant ton budget étudiant !",

    img: "/images/offersStudents/offres-etudiants-weekend-coworking-strasbourg.webp",
  },
];
