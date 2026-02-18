import { Icon } from "@/components/common/Icon";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import PageTitle from "@/components/site/PageTitle";
import SlideUp from "@/utils/animations/slideUp";
import Image from "next/image";

const compagnyPass = () => {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: "https://coworkingcafe.fr" },
          { name: "Notre Concept", url: "https://coworkingcafe.fr/concept" },
        ]}
      />

      <PageTitle title={"Pass entreprise"} />
      <article className="concept py__130">
        <div className="container pb__130">
          <Image
            src="/images/compagny-pass/pass-entreprise-b2B-coworking-strasbourg.webp"
            alt="Espace coworking Anticafé Strasbourg - Ambiance conviviale et boissons à volonté"
            width={1200}
            height={800}
            loading="lazy"
            quality={85}
            className="w-100 thumb__img"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1140px"
          />
          <div className="first__para pt__60">
            <SlideUp>
              <h2 className="t__54">
                Offrez à vos équipes un lieu pour travailler autrement
              </h2>
            </SlideUp>
            <p>
              Le Pass Entreprise CoworKing Café a été pensé pour les
              entreprises, institutions, associations et organisations qui
              souhaitent offrir à leurs collaborateurs, membres ou partenaires
              un accès flexible à un lieu de travail professionnel, sans
              contrainte de bureau fixe.
            </p>
            <p>
              Que ce soit pour du télétravail ponctuel, des journées hors des
              locaux, des temps de concentration, ou simplement pour changer de
              cadre, le Pass Entreprise permet de travailler comme un nomade,
              dans un environnement équipé, convivial et propice à la
              productivité.
            </p>
          </div>
          <div className="thred__para pt__50">
            <h2 className="t__54">
              Une solution simple, flexible et sans engagement rigide
            </h2>
            <p>
              Avec le Pass Entreprise, vous mettez à disposition de vos équipes
              des heures ou des journées de travail à utiliser librement chez
              CoworKing Café, selon leurs besoins et leurs rythmes.
            </p>
            <p>
              Pas d’abonnement individuel à gérer, pas de cartes nominatives
              complexes : nous adaptons la solution au cas par cas, en fonction
              de votre structure, de vos usages et de votre volume.
            </p>
            <div>
              <h2 className="t__54">
                Deux modes de fonctionnement, selon votre organisation
              </h2>
              <h3 className="t__28">1. Le forfait prépayé</h3>
              <p>
                Vous choisissez un montant forfaitaire à l’avance. Ce crédit est
                ensuite déduit au fur et à mesure des consommations (heures ou
                journées passées chez nous par vos collaborateurs ou membres).
              </p>
              <div className="d-flex flex-column">
                <div className="d-flex gap-3 align-items-center">
                  <Icon name="check" /> Idéal pour maîtriser un budget
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <Icon name="check" /> Simple à mettre en place
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <Icon name="check" /> Utilisation souple dans le temps
                </div>
              </div>
            </div>
            <div>
              <h3 className="t__28">2. La facturation mensuelle au réel</h3>
              <p>
                Les consommations sont comptabilisées tout au long du mois, puis
                facturées en fin de période, selon l’utilisation réelle.
              </p>
              <div className="d-flex flex-column">
                <div className="d-flex gap-3 align-items-center">
                  <Icon name="check" /> Parfait pour des usages variables
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <Icon name="check" /> Aucun avance de trésorerie
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <Icon name="check" /> Une facturation claire et transparente
                </div>
              </div>
            </div>
            <div>
              <h3 className="t__28">Pour qui est fait le Pass Entreprise ?</h3>
              <div className="d-flex flex-column mt-4 mb-2">
                <div className="d-flex gap-3 align-items-center">
                  <div>•</div>Entreprises souhaitant proposer une alternative au
                  télétravail à domicile
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div>•</div>Institutions et collectivités
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div>•</div>Associations et réseaux professionnels
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div>•</div>Organisations accompagnant des indépendants,
                  porteurs de projets ou étudiants
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div>•</div>Structures recherchant une solution de tiers-lieu
                  professionnel à Strasbourg
                </div>
              </div>
              C’est aussi un excellent levier pour améliorer le bien-être au
              travail, favoriser l’autonomie et offrir un cadre stimulant à des
              équipes sans bureau fixe.
            </div>
            <div>
              <h3 className="t__28">Un cadre professionnel, clé en main</h3>
              <div className="d-flex flex-column mt-4">
                En venant travailler chez CoworKing Café, vos collaborateurs
                bénéficient :
                <div className="d-flex gap-3 align-items-center mt-2">
                  <div>•</div>D’un espace calme et chaleureux
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div>•</div>D’un wifi très haut débit
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div>•</div>De plusieurs ambiances de travail (open-space,
                  espaces dédiés selon disponibilité)
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div>•</div>De boissons chaudes et fraîches préparées sur
                  place
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div>•</div>D’un lieu pensé pour la concentration, les
                  échanges et la productivité
                </div>
              </div>
              <p className="">
                Le tout, au cœur de Strasbourg, dans un environnement à la fois
                professionnel et humain.
              </p>
            </div>
            <div>
              <h3 className="t__28">
                Une mise en place sur mesure, sur simple demande
              </h3>
              <h4>
                Chaque Pass Entreprise est étudié au cas par cas afin de
                correspondre au mieux à vos attentes et à vos contraintes
                internes.
              </h4>
              <div className="d-flex flex-column mt-4">
                👉 Toute demande se fait par email, afin d’échanger ensemble sur
                :
                <div className="d-flex gap-3 align-items-center mt-2">
                  <div>•</div>votre structure
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div>•</div>le nombre de bénéficiaires
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div>•</div>le volume estimé
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div>•</div>le mode de facturation souhaité
                </div>
              </div>
              <p className="">
                Nous vous accompagnons ensuite dans la mise en place de la
                solution la plus adaptée.
              </p>
            </div>
          </div>
          <div>
            <h3>Intéressé(e) par le Pass Entreprise ?</h3>
            <p>
              📩 Contactez-nous par email pour recevoir une proposition
              personnalisée et découvrir comment le Pass Entreprise CoworKing
              Café peut s’intégrer simplement à votre organisation.
            </p>
          </div>
        </div>
      </article>
      {/* <ConceptDetails /> */}
    </>
  );
};
export default compagnyPass;
