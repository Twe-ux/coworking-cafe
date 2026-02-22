import { AnchorLink } from "@/components/common/AnchorLink";
import { partnerOneLogos } from "../../../db/partnerOneLogos";
import SlideDown from "../../../utils/animations/slideDown";
import SlideUp from "../../../utils/animations/slideUp";
import { Icon } from "@/components/common/Icon";
import Image from "next/image";
import Link from "next/link";
import Partner from "../partner";

const AboutOne = () => {
  return (
    <section className="about py__130" id="about">
      <div className="container">
        <div className="row justify-content-between about__title">
          <SlideDown>
            <div className="col-lg-10">
              <h1 className="title">
                La flexibilité d'un café, le confort de la maison, l'ambiance
                studieuse d'une bibliothèque et l'énergie inspirante d'une
                communauté.
              </h1>
            </div>
          </SlideDown>
        </div>
        <div className="row justify-content-between align-items-center about__wapper">
          <div className="col-xl-5 col-lg-6">
            <SlideUp>
              <div className="about__wapper_left">
                <p>
                  Depuis 2013, Anticafé le plus grand réseau de café coworking
                  en Europe, réinvente la manière de travailler, d'étudier ou de
                  se retrouver.
                </p>
                <br />
                <p>
                  Ouvert en 2017 à Strasbourg, CoworKing Café by Anticafé est né
                  sous l’enseigne Anticafé avant de devenir un lieu indépendant,
                  ancré dans la vie locale. Un espace chaleureux, accessible
                  sans réservation, pensé pour les indépendants, étudiants,
                  télétravailleurs et équipes en quête d’un lieu où travailler
                  comme à la maison, mais en mieux.
                </p>
                <AnchorLink href="/concept#concept" className="circle">
                  <Icon name="arrow-right" />
                  <span>En savoir plus</span>
                </AnchorLink>
              </div>
            </SlideUp>
          </div>
          <div className="col-xl-4 col-lg-6">
            <SlideUp delay={2}>
              <div className="about__wapper_center">
                <Image
                  src="/images/about/open-space-strasbourg.webp"
                  alt="Espace de travail open space - CoworKing Café Anticafé Strasbourg"
                  width={800}
                  height={600}
                  loading="lazy"
                  quality={85}
                  sizes="(max-width: 991px) 100vw, 33vw"
                />
              </div>
            </SlideUp>
          </div>
          <div className="col-xl-3 col-lg-6 mt-5 mt-xl-0">
            <SlideUp delay={3}>
              <ul className="about__wapper_right">
                <li>
                  {/* <Icon name="check" /> */}
                  <span className="">
                    <p className="bold">☕️ Tout compris :</p>
                    <p>
                      cafés, thés et autres boissons à volonté, wifi très haut
                      débit, snack inclus...
                    </p>
                  </span>
                </li>
                <li>
                  {/* <Icon name="check" /> */}
                  <span className="">
                    <p className="bold">⏱️ Payer le temps :</p>
                    <p>6€/heure, 29€/jour ou abonnements semaine et mois</p>
                  </span>
                </li>
                <li>
                  {/* <Icon name="check" /> */}
                  <span className="">
                    <p className="bold">🌼 Ambiance feel good : </p>
                    <p>design chaleureux, calme et échanges naturels</p>
                  </span>
                </li>
                <li>
                  {/* <Icon name="check" /> */}
                  <span className="">
                    <p className="bold">🎉 Ouvert & flexible :</p>
                    <p>
                      ouvert 7J/7, avec ou sans réservation (jusqu'à 5 pers.)
                    </p>
                  </span>
                </li>
              </ul>
            </SlideUp>
          </div>
        </div>
        <Partner data={partnerOneLogos} />
      </div>
    </section>
  );
};

export default AboutOne;
