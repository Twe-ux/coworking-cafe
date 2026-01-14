"use client";

// Import Swiper styles
import { ManifestDetailsProps } from "@/db/manifest/manifestData";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ManifestDetails = ({
  id,
  title,
  description,
  subDescription,
  img,
}: ManifestDetailsProps) => {
  return (
    <div>
      <p className="text-center">
        Ici, on ne vient pas seulement boire un café ou trouver une table où
        poser son ordinateur. On vient chercher{" "}
        <strong>un lieu qui fait du bien</strong> ✨ — où l’on avance, où l’on
        respire, où l’on se sent enfin à sa place.
        <br />
        <br />
        Notre raison d’être : <br />
        <strong>
          offrir un espace pensé pour les travailleurs nomades, les esprits
          créatifs, les étudiants en quête de focus, les équipes qui veulent se
          retrouver
        </strong>{" "}
        🤝 — et toutes celles et ceux qui aiment travailler autrement. Un lieu
        vivant, chaleureux, où l’on se sent accueilli sans chichis, et où l’on
        peut appartenir à une communauté sans jamais devoir jouer un rôle.{" "}
        <br />
        <br />
        Ici, vous n’êtes pas un client de passage : <br /> vous êtes un visage
        familier, une idée en mouvement, un projet qui prend forme 🚀. On se
        croise, on s’inspire, on partage un sourire, un “bon courage”, une
        victoire, une pause — et ça change tout 💛.
        <br />
        <br /> Nous croyons profondément que le travail peut être{" "}
        <strong> plus humain</strong>, plus flexible, plus doux 🌿. Que les
        rencontres comptent autant que les deadlines. Que la productivité naît
        parfois d’un bon matcha, d’une chaise confortable, d’un endroit où l’on
        se sent bien — et souvent d’un regard bienveillant autour de soi.
        <br />
        <br /> Notre ambition : <br />
        <strong>
          {" "}
          créer et faire grandir un lieu où le lien social reprend sa place
        </strong>{" "}
        🤗, où l’isolement du télétravail s’allège, où l’on peut revenir chaque
        jour ou une fois par mois en sachant qu’on sera toujours bienvenu.
        <br />
        <br /> Nous voulons accompagner les transformations du monde du travail,
        sans jamais perdre ce qui nous semble essentiel : <br />
        <strong>
          {" "}
          la chaleur humaine, le local, l’entraide, la simplicité, le plaisir
          d’être ensemble
        </strong>{" "}
        ☕🌟. <br />
        <br />
        Nous croyons que l’avenir sera plus collaboratif, plus créatif, plus
        ancré. Et qu’il a besoin de lieux comme le nôtre pour exister.
        <br />
        <br />
        Bienvenue dans un espace où l’on travaille, mais surtout où l’on vit —
        <strong>
          {" "}
          où chaque moment compte et chaque personne a sa place
        </strong>{" "}
        💫.
      </p>
      <div className="projects__usecase mt-20">
        <img
          src={img}
          alt={`${title} - image ${id}`}
          className="spaces__carousel_img rounded-3 "
        />
      </div>
    </div>
  );
};

export default ManifestDetails;
