/**
 * Concept Page - apps/site
 * Page Concept du CoworKing Café
 *
 * TEXTES: Extraits depuis /source/src/app/(site)/concept/page.tsx
 * Tous les textes copiés mot pour mot
 */

import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Concept | CoworKing Café by Anticafé',
  description:
    'Découvrez CoworKing Café by Anticafé à Strasbourg : un espace chaleureux né du concept Anticafé, où l\'on paie au temps et où l\'on travaille comme à la maison, mais en mieux. Parfait pour freelances, étudiants, voyageurs et télétravailleurs.',
  openGraph: {
    title: 'Concept - CoworKing Café by Anticafé',
    description: 'Découvrez CoworKing Café by Anticafé à Strasbourg.',
    type: 'website'
  },
  alternates: {
    canonical: 'https://coworkingcafe.fr/concept'
  }
};

export default function ConceptPage() {
  return (
    <article className="page-concept py__130">
      <div className="container">
        {/* Page Title */}
        <div className="page-concept__title">
          <h1>Café Coworking</h1>
        </div>

        {/* Main Image */}
        <Image
          src="/images/concept/anticafe-strasbourg.webp"
          alt="Anticafé Strasbourg"
          width={1200}
          height={600}
          className="page-concept__main-image"
          priority
          quality={90}
        />

        {/* First Section */}
        <div className="page-concept__first-section pt__60">
          <h2 className="t__54">Le concept Anticafé : travailler autrement depuis 2013</h2>
          <p>
            Anticafé voit le jour en 2013, porté par Leonid Goncharov, avec l'ambition de créer un
            lieu hybride où travailler et se détendre se rencontrent naturellement. Le modèle est
            simple mais révolutionnaire : on ne paye pas ce que l'on consomme, mais le temps passé
            sur place. Toutes les boissons (chaudes et froides), les en-cas, le wifi, les prises,
            l'espace de travail sont à volonté pendant votre session. Anticafé n'est pas juste un
            café, c'est un tiers-lieu : un mélange entre un salon urbain, un coworking convivial et
            un cocon créatif. Il s'adresse autant aux freelances et télétravailleurs qu'aux
            étudiants et entrepreneurs, dans une ambiance qui favorise les rencontres et la
            créativité.
          </p>
          <p>
            Au fil des années, le réseau Anticafé a grandi : aujourd'hui, plusieurs espaces existent
            en franchise dans des villes comme Lyon, Bordeaux, et Strasbourg.
          </p>
          <p>
            Puis la crise sanitaire est arrivée, bousculant de plein fouet les lieux de vie et de
            travail hybrides. Plusieurs espaces Anticafé à Paris n'ont pas surmonté l'après-Covid et
            ont fermé leurs portes. Mais le concept, lui, n'a jamais disparu. Les trois franchisés,
            Bordeaux, Lyon et nous-mêmes à Strasbourg ; avons continué d'évoluer pour devenir
            indépendant, tout en gardant notre communauté intacte. Le concept continue de vivre et
            d'évoluer à travers des lieux partageant la même vision, comme Hubsy Café & Coworking,
            Nuage Café, Café Craft, ou encore Nomade Café ; des espaces parisiens qui prouvent que
            cette façon de travailler plaît toujours autant et reste pleinement ancrée dans les
            usages urbains.
          </p>
          <p>
            Aujourd'hui, Anticafé reste un pionnier et une référence dans l'univers des
            cafés-coworkings. Et chaque espace encore en activité porte cet ADN : un lieu
            chaleureux, flexible, pensé pour travailler autrement, se rencontrer, apprendre, créer,
            connecter.
          </p>
        </div>

        {/* Third Section (Main Content) */}
        <div className="page-concept__third-section pt__50">
          <h2 className="t__54">
            CoworKing Café by Anticafé : le meilleur café pour travailler à Strasbourg
          </h2>
          <h3 className="t__28">
            Un espace pensé pour les indépendants, télétravailleurs, étudiants et voyageurs
          </h3>
          <p>
            À Strasbourg, l'aventure commence fin 2017 avec l'ouverture d'un espace Anticafé en
            franchise. Dès le début, l'accueil est fort : freelances, étudiants, voyageurs,
            télétravailleurs, équipes… tout le monde adopte ce format "comme à la maison, mais en
            mieux" . Avec le temps, l'équipe a choisi de faire évoluer le lieu pour l'ancrer
            pleinement dans la vie locale. C'est ainsi qu'est né CoworKing Café by Anticafé : un
            espace indépendant dans son fonctionnement, mais qui garde l'ADN et l'esprit du concept
            originel.
          </p>

          <div className="page-concept__features">
            <ul>
              <li>une ambiance chaleureuse, simple et humaine</li>
              <li>un espace modulable selon les besoins</li>
            </ul>
            <ul>
              <li>une atmosphère calme dans un quartier très animé</li>
              <li>une offre variée de boissons et d'encas</li>
            </ul>
          </div>

          <h3 className="t__28">Le coworking flexible au cœur du centre-ville</h3>
          <p>Nos forfaits s'adaptent à votre rythme :</p>
          <ul>
            <li>
              6 € / l'heure — idéal pour une visio, une réu express ou une session focus.
            </li>
            <li>29 € / la journée — pour travailler sans stress du chrono</li>
            <li>
              99 € / la semaine — parfait pour les nomades et les voyageurs en passage prolongé.
            </li>
            <li>290 € / le mois — votre QG flexible en plein centre-ville.</li>
          </ul>
        </div>

        {/* Second Section (Image + Who is it for) */}
        <div className="page-concept__second-section pt__60">
          <div className="row justify-content-between align-items-center">
            <div className="col-md-6">
              <Image
                src="/images/concept/cafe-coworking-strasbourg.webp"
                alt="Café coworking Strasbourg"
                width={600}
                height={800}
                loading="lazy"
                quality={85}
                className="page-concept__section-image"
              />
            </div>
            <div className="col-md-5 mt-4 mt-md-0">
              <div className="page-concept__section-content">
                <h3 className="t__28">Pour qui est fait CoworKing Café by Anticafé ?</h3>
                <p>Nous accueillons aussi bien :</p>
                <ul>
                  <li>les indépendants qui veulent un QG sans engagement,</li>
                  <li>
                    les étudiants à la recherche d'un lieu pour réviser efficacement,
                  </li>
                  <li>les télétravailleurs qui fuient le domicile,</li>
                  <li>
                    les voyageurs qui ont besoin d'un espace propre et fonctionnel entre deux
                    logements,
                  </li>
                  <li>
                    les équipes qui veulent sortir du bureau pour se recentrer et avancer.
                  </li>
                </ul>
                <p>
                  CoworKing Café by Anticafé, c'est un cocon urbain, un tiers-lieu moderne, un
                  espace de travail vivant, pensé pour s'adapter à chaque rythme, chaque besoin,
                  chaque journée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
