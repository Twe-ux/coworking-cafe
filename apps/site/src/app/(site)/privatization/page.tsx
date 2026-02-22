import { IconArrowRight, IconCheck } from "@/components/icons/CriticalIcons";
import Partner from "@/components/site/partner";
import { TestimonialsSwiper } from "@/components/site/privatization/TestimonialsSwiper";
import { partnerOneLogos } from "@/db/partnerOneLogos";
import { privatisationData } from "@/db/privatisation/privatisationData";
import SlideDown from "@/utils/animations/slideDown";
import SlideUp from "@/utils/animations/slideUp";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privatisation Événements B2B | CoworKing Café Strasbourg",
  description:
    "Privatisez notre espace de 180m² pour vos séminaires, formations et team building à Strasbourg. De 15 à 50 personnes, équipements pro inclus.",
  keywords: [
    "privatisation coworking Strasbourg",
    "location salle événement Strasbourg",
    "séminaire entreprise Strasbourg",
    "team building Strasbourg",
    "salle formation Strasbourg",
    "événement B2B Strasbourg",
  ],
  alternates: {
    canonical: "https://coworkingcafe.fr/privatization",
  },
  openGraph: {
    title: "Privatisation CoworKing Café | Événements B2B Strasbourg",
    description:
      "180m² modulables pour vos événements professionnels : séminaires, formations, team building. De 15 à 50 personnes.",
    url: "https://coworkingcafe.fr/privatization",
    siteName: "CoworKing Café by Anticafé",
    images: [
      {
        url: "https://coworkingcafe.fr/images/professional/privatisation-anticafe-strasbourg.webp",
        width: 1200,
        height: 630,
        alt: "Privatisation CoworKing Café Strasbourg - Événements B2B",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privatisation CoworKing Café Strasbourg",
    description:
      "180m² pour vos événements B2B : séminaires, formations, team building à Strasbourg",
    images: [
      "https://coworkingcafe.fr/images/professional/privatisation-anticafe-strasbourg.webp",
    ],
  },
};

const Privatization = () => {
  return (
    <div className="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EventVenue",
            name: "CoworKing Café by Anticafé",
            description:
              "Espace de coworking privatisable pour événements professionnels à Strasbourg",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Strasbourg",
              addressRegion: "Grand Est",
              addressCountry: "FR",
            },
            maximumAttendeeCapacity: 50,
            minimumAttendeeCapacity: 15,
            floorSize: {
              "@type": "QuantitativeValue",
              value: 180,
              unitCode: "MTK",
            },
            amenityFeature: [
              {
                "@type": "LocationFeatureSpecification",
                name: "WiFi haut débit",
                value: true,
              },
              {
                "@type": "LocationFeatureSpecification",
                name: "Équipement audiovisuel",
                value: true,
              },
              {
                "@type": "LocationFeatureSpecification",
                name: "Restauration sur place",
                value: true,
              },
            ],
            priceRange: "550€-1490€",
            offers: [
              {
                "@type": "Offer",
                name: "Soirée",
                price: "550",
                priceCurrency: "EUR",
                description: "Privatisation soirée",
              },
              {
                "@type": "Offer",
                name: "Demi-journée",
                price: "880",
                priceCurrency: "EUR",
                description: "Privatisation demi-journée",
              },
              {
                "@type": "Offer",
                name: "Journée complète",
                price: "1490",
                priceCurrency: "EUR",
                description: "Privatisation journée complète",
              },
            ],
          }),
        }}
      />
      <section className="banner overflow-hidden">
        <div className="container position-relative">
          <div className="row">
            <div className="col-lg-9">
              <div className="banner__content">
                <div className="banner__content_title ">
                  <SlideUp>
                    <h1 className="title">Privatisation de CoworKing Café</h1>
                  </SlideUp>
                  <SlideUp delay={2}>
                    <p>
                      Organiser un événement professionnel demande plus qu'une
                      salle : il faut un lieu qui donne envie de se rassembler,
                      d'échanger et de créer du lien, tout en offrant des
                      conditions de travail irréprochables. Chez{" "}
                      <Link href="/">Coworking Café by Anticafé</Link>, nous
                      proposons la privatisation complète de notre établissement
                      pour vos événements B2B à Strasbourg, dans un cadre à la
                      fois inspirant, fonctionnel et humain. Ici, pas de salle
                      froide ni impersonnelle. Pas non plus de café bruyant.
                      Notre force : un espace hybride, pensé dès l'origine pour
                      le travail, la collaboration et la concentration, que nous
                      mettons entièrement à votre disposition le temps de votre
                      événement.
                    </p>
                  </SlideUp>
                </div>
                <SlideUp
                  delay={3}
                  className="buttons d-sm-flex align-items-center"
                >
                  <Link
                    href={"/privatization/devis"}
                    className="common__btn buttons_file"
                  >
                    <span>Demande de devis</span>
                    {/* <IconArrowRight size={14} /> */}
                  </Link>
                  {/* <Link
                  href={"/pricing#pricing"}
                  className="common__btn buttons_outline mt-4 mt-sm-0"
                >
                  <span>Nos tarifs</span>
                  <IconArrowRight size={14} />
                </Link> */}
                </SlideUp>
                <SlideUp
                  delay={4}
                  className="banner__content_number d-flex justify-content-between"
                >
                  <div>
                    <h4>180 m2</h4>
                    <p>sur 2 niveaux</p>
                  </div>
                  <div>
                    <h4>de 15 à 50 pax </h4>
                    <p>capacité</p>
                  </div>
                  <div>
                    <h4>550 HT</h4>
                    <p>à partir de</p>
                  </div>
                </SlideUp>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="banner__right">
                <Image
                  src="/images/banner/logo-circle-white.webp"
                  alt="CoworKing Café Strasbourg privatisation événements professionnels logo"
                  width={250}
                  height={250}
                  className="logo__circle"
                  priority
                  sizes="250px"
                />
                <div>
                  <Image
                    src="/images/professional/privatisation-anticafe-strasbourg.webp"
                    alt="Privatisation espace coworking événements B2B séminaires Strasbourg"
                    width={800}
                    height={600}
                    className="bg__img"
                    priority
                    sizes="(max-width: 991px) 100vw, 25vw"
                    quality={85}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="position-absolute top-0 h-100 w-100"> */}
          <div className="position-relative w-100 h-100">
            <div className="banner__shap_1 banner__shap" />
            <div className="banner__shap_2 banner__shap" />
            <div className="banner__shap_3 banner__shap" />
            <div className="banner__shap_4 banner__shap" />
          </div>
          {/* </div> */}
        </div>
      </section>
      <section className="about py__130" id="about">
        <div className="container">
          <div className="row justify-content-between about__title">
            <SlideDown>
              <div className="col-lg-10">
                <h2 className="title">
                  À qui s'adresse la privatisation de CoworKing Café ?
                </h2>
              </div>
            </SlideDown>
          </div>
          <div className="row justify-content-between align-items-center about__wapper">
            <div className="col-xl-6 col-lg-5">
              <SlideUp>
                <div className="about__wapper_left">
                  <p>
                    La privatisation s'adresse aux entreprises, équipes,
                    formateurs, coachs, entrepreneurs, marques, collectifs et
                    associations qui recherchent un lieu événementiel différent,
                    à taille humaine, au cœur de Strasbourg. Nous accueillons
                    exclusivement des événements à vocation professionnelle :
                    réunions d'équipe, séminaires, formations, workshops,
                    conférences, tables rondes, team buildings, lancements de
                    produits ou encore points boutiques éphémères. Découvrez{" "}
                    <Link href="/spaces">nos espaces modulables</Link>. Ce
                    positionnement volontairement clair nous permet de garantir
                    un cadre cohérent, qualitatif et respectueux du lieu comme
                    de ses usages.
                  </p>
                </div>
              </SlideUp>
            </div>
            <div className="col-xl-6 col-lg-5">
              <SlideUp delay={2}>
                <div className="about__wapper_center">
                  <Image
                    src="/images/professional/privatisation-coworking-strasbourg.webp"
                    alt="Salle de réunion modulable privatisation team building Strasbourg"
                    width={800}
                    height={600}
                    loading="lazy"
                    quality={85}
                    sizes="(max-width: 991px) 100vw, 33vw"
                  />
                </div>
              </SlideUp>
            </div>
          </div>
          <Partner data={partnerOneLogos} />
        </div>
      </section>
      <section className="projects" id="projects">
        <div className="container">
          {/* title Start */}
          <SlideDown className="d-flex align-items-center ">
            <h2 className="title">
              Un lieu équipé et modulable pour vos événements professionnels
            </h2>
          </SlideDown>
          {/* title End */}
          <div className="projects__wapper">
            {privatisationData.map(
              ({ categories, subCategories, id, imgSrc, title }) => {
                return (
                  <SlideUp
                    delay={id}
                    key={id}
                    className="projects__wapper_card"
                  >
                    <div className="d-flex flex-column gap-5 mb-4">
                      <Image
                        src={imgSrc}
                        alt={`Privatisation ${title} événements professionnels CoworKing Café Strasbourg`}
                        width={600}
                        height={400}
                        loading="lazy"
                        quality={85}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="h-text">
                      <div className="d-flex align-items-center "></div>
                      <p className="project__group mb-3 text-white">
                        {categories}
                      </p>
                      <p className="project__group">{subCategories}</p>
                    </div>
                  </SlideUp>
                );
              },
            )}
          </div>
        </div>
      </section>

      <section className="about pb__130" id="about">
        <div className="container">
          <div className="row justify-content-between about__title">
            <SlideDown>
              <div className="col-lg-10">
                <div>
                  <h2 className="title">
                    Formats & conditions de privatisation
                  </h2>
                </div>
              </div>
            </SlideDown>
          </div>
          <div className="row justify-content-between align-items-center about__wapper">
            <div className="col-xl-5 col-lg-6">
              <SlideUp>
                <div className="about__wapper_left">
                  <p>
                    Les privatisations se font uniquement sur demande et sur
                    devis, afin de garantir un événement adapté à votre format
                    et à vos objectifs.
                  </p>
                  <Link href="/privatization/devis" className="circle">
                    <IconArrowRight size={28} />

                    <span>Demande de devis</span>
                  </Link>
                </div>
              </SlideUp>
            </div>
            <div className="col-xl-4 col-lg-6">
              <SlideUp delay={2}>
                <div className="about__wapper_center">
                  <img
                    src="/images/about/Rectangle105.webp"
                    alt="Salle de réunion privatisée séminaire formation Strasbourg"
                  />
                </div>
              </SlideUp>
            </div>
            <div className="col-xl-3 col-lg-6 mt-5 mt-xl-0">
              <SlideUp delay={3}>
                <ul className="about__wapper_right">
                  <li>
                    <span>Nous proposons plusieurs formats :</span>
                  </li>
                  <li>
                    <IconCheck />
                    <span>
                      Demi-journée (matin ou après- midi), à partir de 880 € HT
                    </span>
                  </li>
                  <li>
                    <IconCheck />
                    <span>Journée complète, à partir de 1 490 € HT</span>
                  </li>
                  <li>
                    <IconCheck />
                    <span>Soirée, à partir de 550 € HT</span>
                  </li>
                </ul>
              </SlideUp>
            </div>
          </div>
          <h2 className="title mt-5 pt-5">
            Pourquoi choisir Coworking Café pour votre événement ?
          </h2>
          <p className="title__paragraph mt-5">
            Privatiser Coworking Café, c'est faire le choix d'un lieu
            événementiel B2B différent, déjà reconnu pour la qualité de son
            accueil et de son atmosphère, comme lors de{" "}
            <Link href="/events#events">nos événements réguliers</Link>. C'est
            aussi bénéficier :
          </p>
          <ul className="about__wapper_right mt-4">
            <li className="">
              <IconCheck />
              d'un espace pensé pour le travail et l'échange, pas simplement
              loué pour l'occasion
            </li>
            <li>
              <IconCheck />
              de l'ADN Anticafé, pionnier du café-coworking, allié à un fort
              ancrage local strasbourgeois
            </li>
            <li>
              <IconCheck />
              d'un cadre chaleureux qui favorise la participation, l'attention
              et les rencontres
            </li>
            <li>
              <IconCheck />
              d'une équipe réactive, habituée à accueillir des groupes
              professionnels
            </li>
          </ul>
        </div>
      </section>
      <section className="testimonial py__110 h-dvh">
        <div className="container position-relative">
          {/* title Start */}
          <SlideDown className="">
            <h2 className="title text-center">
              Merci pour vos retours! <br /> Parce que vous contribuez à notre
              succès...
            </h2>
          </SlideDown>
          {/* title End */}
          <SlideUp className="testimonial__wapper">
            <TestimonialsSwiper />
          </SlideUp>
        </div>
      </section>

      <section className="priva pb__130 container">
        {/* <h1 className="title text-center mb-5">
          Pourquoi venir à CoworKing Café ? <br />
          Pour ça !
        </h1> */}

        <p className="project__group  text-center  ">
          Vous souhaitez organiser un événement professionnel à Strasbourg dans
          un lieu chaleureux, fonctionnel et central ? Présentez-nous votre
          projet par email (date, format, nombre de personnes, besoins
          spécifiques). Nous étudierons votre demande et reviendrons vers vous
          avec une proposition adaptée.{" "}
          <Link href="/privatization/devis">Demandez un devis</Link> personnalisé.
        </p>
        {/* Links to devis form */}
        <div className="text-center">
          <Link
            href="/privatization/devis"
            className="common__btn me-md-3 mb-3 mb-md-0 d-block d-md-inline-block"
          >
            <span>Demander un devis</span>
          </Link>
        </div>
      </section>

      <div className="py__130"></div>
    </div>
  );
};

export default Privatization;
