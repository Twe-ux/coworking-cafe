/**
 * History Page - apps/site
 * Histoire du CoworKing Café et présentation de l'équipe
 *
 * TEXTES: Copiés mot pour mot depuis /source/src/app/(site)/history/page.tsx
 * Structure: Présentation chronologique du lieu + section équipe
 */

import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Notre Histoire | CoworKing Café by Anticafé',
  description:
    'De deux parcours croisés à un lieu vivant au cœur de Strasbourg. Découvrez l\'histoire du CoworKing Café depuis 2017.',
  keywords: ['histoire coworking strasbourg', 'anticafé strasbourg', 'équipe coworking'],
  openGraph: {
    title: 'Notre Histoire | CoworKing Café',
    description: 'De deux parcours croisés à un lieu vivant au cœur de Strasbourg',
    url: 'https://coworkingcafe.fr/history',
    siteName: 'CoworKing Café',
    images: [
      {
        url: '/images/history/histoire-coworking-strasbourg.webp',
        width: 1200,
        height: 630,
        alt: 'Histoire du CoworKing Café Strasbourg'
      }
    ],
    type: 'website'
  },
  alternates: { canonical: 'https://coworkingcafe.fr/history' }
};

export default function HistoryPage() {
  return (
    <main className="page-history">
      <article className="page-history__article py-5">
        <div className="container">
          {/* Hero Image */}
          <Image
            src="/images/history/histoire-coworking-strasbourg.webp"
            alt="Histoire du CoworKing Café Strasbourg"
            width={1200}
            height={600}
            priority
            quality={90}
            className="w-100 page-history__hero-image rounded-3"
          />

          {/* Première Partie */}
          <div className="page-history__first-section pt-5">
            <h1 className="page-history__title">
              Notre histoire : de deux parcours croisés à un lieu vivant au cœur de Strasbourg
            </h1>

            <p className="page-history__text text-black mt-4">
              Tout a commencé autour de 2012, quelque part entre Aix-en-Provence et Marseille 🌞. <br />
              Deux parcours qui se croisent : Christèle, manageuse passionnée et déjà pleine d&apos;idées
              entrepreneuriales, et Thierry, directeur des opérations chez Domino&apos;s Pizza, Alsacien d&apos;origine. Deux
              personnalités complémentaires, un duo dans la vie comme au travail — et déjà cette envie commune de
              construire quelque chose ensemble.
            </p>

            <h2 className="page-history__subtitle mt-4">2015 : une famille naissante, un rêve qui s&apos;affine</h2>

            <p className="page-history__text text-black mt-3">
              Lorsqu&apos;ils décident de fonder une famille, une évidence s&apos;impose : Christèle déborde de projets… mais n&apos;a
              jamais d&apos;endroit où s&apos;installer pour travailler. Pas de lieu chaleureux, pas d&apos;espace créatif, pas de refuge
              pour brainstormer sereinement. Alors l&apos;idée mûrit : "Et si on créait le café que nous aurions nous-mêmes
              aimé trouver ? Un lieu où l&apos;on peut venir travailler sans se sentir de trop, sans se presser, en étant
              accueilli." En parallèle, l&apos;envie de quitter le sud se fait sentir. Strasbourg apparaît comme une évidence
              : une ville vivante, humaine, et surtout le berceau familial de Thierry.
            </p>

            <h2 className="page-history__subtitle mt-4">2016–2017 : le grand saut</h2>

            <p className="page-history__text text-black mt-3">
              Dans leurs recherches, ils tombent sur un concept encore rare : Anticafé, pionnier du café au temps en
              France. Une franchise recherche justement des franchisés à Strasbourg. Timing parfait. Vibration parfaite.
              Go. Ils déménagent en 2016, montent le projet en 2017 et, après des mois de travaux, d&apos;excitation, de
              doutes, d&apos;élans et de nuits blanches…
            </p>

            <p className="page-history__text text-black mt-3">📅 Le 18 décembre 2017, Anticafé Strasbourg ouvre enfin ses portes.</p>

            <h2 className="page-history__subtitle mt-4">2018–2019 : deux années lumineuses ✨</h2>

            <p className="page-history__text text-black mt-3">
              Les débuts sont au-delà de leurs espérances. Le lieu trouve immédiatement son public : étudiants,
              indépendants, équipes, voyageurs… Tous reconnaissent ce qu&apos;ils ont voulu créer : un espace chaleureux,
              accessible, fluide, où l&apos;on peut vraiment se poser pour travailler.
            </p>

            <h2 className="page-history__subtitle mt-4">2020–2022 : la tempête du Covid</h2>

            <p className="page-history__text text-black mt-3">
              Et puis… le monde s&apos;arrête. Fermetures administratives, restrictions, passages à vide, reprise timide,
              incertitudes constantes. Pendant près de deux ans et demi, ils tiennent bon. Beaucoup de sacrifices,
              beaucoup de résilience. Beaucoup de fois où ils auraient pu (logiquement) abandonner. Mais jamais l&apos;envie de
              continuer n&apos;a disparu. Car ce lieu n&apos;était pas juste un commerce : c&apos;était leur projet de vie, leur énergie,
              leur ancrage dans Strasbourg.
            </p>

            <h2 className="page-history__subtitle mt-4">2023 : un nouveau souffle</h2>

            <p className="page-history__text text-black mt-3">
              L&apos;activité reprend, les clients reviennent, les nouveaux affluent. Le lieu retrouve son essence : un
              café-coworking vivant, ancré localement, profondément humain. Et une transformation naturelle s&apos;opère : même
              s&apos;ils restent "CoworKing Café by Anticafé", ils deviennent plus indépendants, plus adaptés à la vie locale,
              plus libres d&apos;évoluer à leur rythme.
            </p>
          </div>

          {/* Deuxième Partie */}
          <div className="page-history__second-section pt-5">
            <h2 className="page-history__subtitle">Aujourd&apos;hui : un espace pour toutes les manières de travailler</h2>

            <div className="row align-items-center mt-4">
              <div className="col-md-6">
                <Image
                  src="/images/history/histoire-anticafe-strasbourg.webp"
                  alt="Anticafé Strasbourg aujourd'hui"
                  width={600}
                  height={400}
                  quality={85}
                  className="w-100 rounded-3"
                />
              </div>

              <div className="col-md-5 mt-4 mt-md-0">
                <div>
                  <p className="page-history__text text-black">Le lieu accueille chaque jour :</p>
                  <ul className="page-history__list text-black mt-3 d-flex flex-column gap-3">
                    <li>✨ des freelances en quête d&apos;un refuge productif</li>
                    <li>✨ des étudiants en mode révisions ou projets de groupe</li>
                    <li>✨ des télétravailleurs qui fuient le canapé pour retrouver de l&apos;énergie</li>
                    <li>✨ des équipes pour des réunions, formations ou journées off-site</li>
                    <li>
                      ✨ des voyageurs qui cherchent un endroit fiable, calme et chaleureux pour travailler entre deux
                      trains
                    </li>
                  </ul>
                </div>
              </div>

              <p className="page-history__text text-black mt-4">
                Six jours sur sept, depuis bientôt dix ans, Christèle et Thierry veillent au grain, accueillent,
                préparent, réparent, conseillent, sourient. Ils n&apos;ont jamais cessé d&apos;y croire. Et ça se voit. Ça se
                ressent. Ça se vit.
              </p>
            </div>
          </div>

          {/* Section Équipe */}
          <section className="page-history__team-section py-5">
            <h2 className="page-history__subtitle">L&apos;équipe : des personnalités, un même lieu à faire vivre</h2>

            <p className="page-history__text text-black mt-4">
              Derrière CoworKing Café by Anticafé, il n&apos;y a pas qu&apos;un concept : il y a une équipe. Une petite tribu qui font
              battre le cœur du lieu au quotidien ☕✨
            </p>

            <p className="page-history__text text-black mt-3">
              Nous sommes baristas, hôtes, conseillers improvisés, techniciens du quotidien, ambiance managers,
              préparateurs de cappuccinos parfaitement mousseux, réparateurs de prises capricieuses… et surtout, gardiens
              d&apos;un espace où chacun doit se sentir bien.
            </p>

            <p className="page-history__text text-black mt-3">
              Il y a les sourires du matin, les cafés qui démarrent une bonne journée, les coups de main spontanés, les
              "tu préfères un spot plus calme ?", les "pas de souci, on te trouve une prise", les "tu veux tester notre
              nouveau matcha ?". Il y a les allers-retours au comptoir, les rencontres entre clients, les petites
              attentions… et cette vraie joie de contribuer à vos projets, qu&apos;ils soient minuscules ou gigantesques.
            </p>

            <p className="page-history__text text-black mt-3">
              Nous avons des personnalités différentes, des parcours variés, mais une énergie commune : 🎯 accueillir,
              accompagner, faciliter, et créer un lieu où travailler devient un plaisir.
            </p>

            <p className="page-history__text text-black mt-3">
              Christèle et Thierry sont aux commandes, mais le lieu vit grâce à toute l&apos;équipe : ceux qui vous servent
              votre latte du jour, ceux qui ajustent la musique, ceux qui préparent la salle du haut, ceux qui répondent
              à vos questions, ceux qui connaissent vos habitudes par cœur.
            </p>

            <p className="page-history__text text-black mt-3">
              Un vrai travail d&apos;équipe, discret mais essentiel, pour que votre journée ici soit fluide, sereine et
              inspirante.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
