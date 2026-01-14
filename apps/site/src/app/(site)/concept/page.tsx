import ConceptDetails from "@/components/site/concept/conceptDetails";
import PageTitle from "@/components/site/pageTitle";
import SlideUp from "@/utils/animations/slideUp";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Concept | CoworKing Café by Anticafé",
  description: `Découvrez CoworKing Café by Anticafé à Strasbourg : un espace chaleureux né du concept Anticafé, où l’on paie au temps et où l’on travaille comme à la maison, mais en mieux. Parfait pour freelances, étudiants, voyageurs et télétravailleurs.`,
  openGraph: {
    title: "Concept - CoworKing Café by Anticafé",
    description: "Découvrez CoworKing Café by Anticafé à Strasbourg.",
    type: "website",
  },
};

const Concept = () => {
  return (
    <>
      <PageTitle title={"Café Coworking"} />
      <article className="concept py__130">
        <div className="container">
          <img
            src="/images/concept/anticafe-strasbourg.webp"
            alt="anticafe-strasbourg"
            className="w-100 thumb__img"
          />
          <div className="first__para pt__60">
            <SlideUp>
              <h2 className="t__54">
                Le concept Anticafé : travailler autrement depuis 2013
              </h2>
            </SlideUp>
            <p>
              Anticafé voit le jour en 2013, porté par Leonid Goncharov, avec
              l’ambition de créer un lieu hybride où travailler et se détendre
              se rencontrent naturellement. Le modèle est simple mais
              révolutionnaire : on ne paye pas ce que l’on consomme, mais le
              temps passé sur place. Toutes les boissons (chaudes et froides),
              les en-cas, le wifi, les prises, l’espace de travail sont à
              volonté pendant votre session. Anticafé n’est pas juste un café,
              c’est un tiers-lieu : un mélange entre un salon urbain, un
              coworking convivial et un cocon créatif. Il s’adresse autant aux
              freelances et télétravailleurs qu’aux étudiants et entrepreneurs,
              dans une ambiance qui favorise les rencontres et la créativité.
            </p>
            <p>
              Au fil des années, le réseau Anticafé a grandi : aujourd’hui,
              plusieurs espaces existent en franchise dans des villes comme
              Lyon, Bordeaux, et Strasbourg.
            </p>
            <p>
              Puis la crise sanitaire est arrivée, bousculant de plein fouet les
              lieux de vie et de travail hybrides. Plusieurs espaces Anticafé à
              Paris n’ont pas surmonté l’après-Covid et ont fermé leurs portes.
              Mais le concept, lui, n’a jamais disparu. Les trois franchisés,
              Bordeaux, Lyon et nous-mêmes à Strasbourg ; avons continué
              d’évoluer pour devenir indépendant, tout en gardant notre
              communauté intacte. Le concept continue de vivre et d’évoluer à
              travers des lieux partageant la même vision, comme Hubsy Café &
              Coworking, Nuage Café, Café Craft, ou encore Nomade Café ; des
              espaces parisiens qui prouvent que cette façon de travailler plaît
              toujours autant et reste pleinement ancrée dans les usages
              urbains.
            </p>
            <p>
              Aujourd’hui, Anticafé reste un pionnier et une référence dans
              l’univers des cafés-coworkings. Et chaque espace encore en
              activité porte cet ADN : un lieu chaleureux, flexible, pensé pour
              travailler autrement, se rencontrer, apprendre, créer, connecter.
            </p>
          </div>
          <div className="thred__para pt__50">
            <h2 className="t__54">
              CoworKing Café by Anticafé : le meilleur café pour travailler à
              Strasbourg
            </h2>
            <h3 className="t__28">
              Un espace pensé pour les indépendants, télétravailleurs, étudiants
              et voyageurs
            </h3>
            <p>
              À Strasbourg, l’aventure commence fin 2017 avec l’ouverture d’un
              espace Anticafé en franchise. Dès le début, l’accueil est fort :
              freelances, étudiants, voyageurs, télétravailleurs, équipes… tout
              le monde adopte ce format “comme à la maison, mais en mieux” .
              Avec le temps, l’équipe a choisi de faire évoluer le lieu pour
              l’ancrer pleinement dans la vie locale. C’est ainsi qu’est né
              CoworKing Café by Anticafé : un espace indépendant dans son
              fonctionnement, mais qui garde l’ADN et l’esprit du concept
              originel.
            </p>
            <SlideUp>
              <div className="d-flex gap-3 ">
                <ul className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <li>une ambiance chaleureuse, simple et humaine</li>
                  <li>un espace modulable selon les besoins</li>
                </ul>
                <ul className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <li>une atmosphère calme dans un quartier très animé</li>

                  <li>une offre variée de boissons et d’encas</li>
                </ul>
              </div>
            </SlideUp>

            <h3 className="t__28">
              Le coworking flexible au cœur du centre-ville
            </h3>
            <p> Nos forfaits s’adaptent à votre rythme :</p>
            <ul>
              <li>
                6 € / l’heure — idéal pour une visio, une réu express ou une
                session focus.
              </li>
              <li>29 € / la journée — pour travailler sans stress du chrono</li>
              <li>
                99 € / la semaine — parfait pour les nomades et les voyageurs en
                passage prolongé.
              </li>
              <li>
                290 € / le mois — votre QG flexible en plein centre-ville.
              </li>
            </ul>
          </div>
          <div className="second__para pt__60">
            <div className="row justify-content-between align-items-center">
              <SlideUp className="col-md-6">
                <img
                  src="/images/concept/cafe-coworking-strasbourg.webp"
                  alt="cafe-coworking-strasbourg"
                  className="w-100 thumb__img"
                />
              </SlideUp>
              <SlideUp className="col-md-5 mt-4 mt-md-0">
                <div>
                  <h3 className="t__28">
                    Pour qui est fait CoworKing Café by Anticafé ?
                  </h3>
                  <p> Nous accueillons aussi bien :</p>
                  <ul>
                    <li>les indépendants qui veulent un QG sans engagement,</li>
                    <li>
                      les étudiants à la recherche d’un lieu pour réviser
                      efficacement,
                    </li>
                    <li>les télétravailleurs qui fuient le domicile,</li>
                    <li>
                      les voyageurs qui ont besoin d’un espace propre et
                      fonctionnel entre deux logements,
                    </li>
                    <li>
                      les équipes qui veulent sortir du bureau pour se recentrer
                      et avancer.
                    </li>
                  </ul>
                  <p>
                    CoworKing Café by Anticafé, c’est un cocon urbain, un
                    tiers-lieu moderne, un espace de travail vivant, pensé pour
                    s’adapter à chaque rythme, chaque besoin, chaque journée.
                  </p>
                </div>
              </SlideUp>
            </div>
          </div>
        </div>
      </article>
      <ConceptDetails />
    </>
  );
};

export default Concept;
