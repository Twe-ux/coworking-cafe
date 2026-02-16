"use client";

import { Icon } from "@/components/common/Icon";
import Partner from "@/components/site/partner";
import { partnerOneLogos } from "@/db/partnerOneLogos";
import { professionalData } from "@/db/professional/professionalData";
import { testimonialsOneData } from "@/db/testimonialsOneData";
import SlideDown from "@/utils/animations/slideDown";
import SlideUp from "@/utils/animations/slideUp";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Swiper as SwiperType } from "swiper";
import "swiper/css";
// @ts-ignore - react-modal-video types not available
import ModalVideo from "react-modal-video";
import { Navigation, Pagination as PaginationModule } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const Professional = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const handlePaginationClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("slide-dots") && swiperRef.current) {
        e.preventDefault();
        e.stopPropagation();
        const page = parseInt(target.getAttribute("data-page") || "1", 10);
        // slideToLoop utilise un index basé sur 0
        swiperRef.current.slideToLoop(page - 1, 500);
      }
    };

    // Utiliser setTimeout pour s'assurer que le DOM est prêt
    const timer = setTimeout(() => {
      const paginationEl = document.querySelector(".testimonial-pagination");
      if (paginationEl) {
        paginationEl.addEventListener(
          "click",
          handlePaginationClick as EventListener,
        );
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      const paginationEl = document.querySelector(".testimonial-pagination");
      if (paginationEl) {
        paginationEl.removeEventListener(
          "click",
          handlePaginationClick as EventListener,
        );
      }
    };
  }, []);

  const [isOpen, setOpen] = useState(false);

  return (
    <div className="pb__130">
      <section className="banner overflow-hidden">
        <div className="container position-relative">
          <div className="row">
            <div className="col-lg-9">
              <div className="banner__content">
                <div className="banner__content_title ">
                  <SlideUp>
                    <h1 className="title">Privatisation de Cow-or-King Café</h1>
                  </SlideUp>
                  <SlideUp delay={2}>
                    <p>
                      Organiser un événement professionnel demande plus qu’une
                      salle : il faut un lieu qui donne envie de se rassembler,
                      d’échanger et de créer du lien, tout en offrant des
                      conditions de travail irréprochables. Chez Coworking Café
                      by Anticafé, nous proposons la privatisation complète de
                      notre établissement pour vos événements B2B à Strasbourg,
                      dans un cadre à la fois inspirant, fonctionnel et humain.
                      Ici, pas de salle froide ni impersonnelle. Pas non plus de
                      café bruyant. Notre force : un espace hybride, pensé dès
                      l’origine pour le travail, la collaboration et la
                      concentration, que nous mettons entièrement à votre
                      disposition le temps de votre événement.
                    </p>
                  </SlideUp>
                </div>
                <SlideUp
                  delay={3}
                  className="buttons d-sm-flex align-items-center"
                >
                  <Link
                    href={"/spaces#spaces"}
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
                  alt="CoworKing Café by Anticafé Strasbourg - Logo circulaire"
                  width={250}
                  height={250}
                  className="logo__circle"
                  priority
                  sizes="250px"
                />
                <div>
                  <Image
                    src="/images/professional/privatisation-anticafe-strasbourg.webp"
                    alt="Espace de coworking avec boissons à volonté - CoworKing Café Strasbourg"
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
                <h1 className="title">
                  La privatisation de Cow-or-King Café s’adresse aux
                  entreprises, équipes, formateurs, coachs, entrepreneurs,
                  marques, collectifs et associations...
                </h1>
              </div>
            </SlideDown>
          </div>
          <div className="row justify-content-between align-items-center about__wapper">
            <div className="col-xl-5 col-lg-6">
              <SlideUp>
                <div className="about__wapper_left">
                  <p>
                    ..qui recherchent un lieu événementiel différent, à taille
                    humaine, au cœur de Strasbourg. Nous accueillons
                    exclusivement des événements à vocation professionnelle :
                    réunions d’équipe, séminaires, formations, workshops,
                    conférences, tables rondes, team buildings, lancements de
                    produits ou encore points boutiques éphémères. Ce
                    positionnement volontairement clair nous permet de garantir
                    un cadre cohérent, qualitatif et respectueux du lieu comme
                    de ses usages.
                  </p>
                </div>
              </SlideUp>
            </div>
            <div className="col-xl-4 col-lg-6">
              <SlideUp delay={2}>
                <div className="about__wapper_center">
                  <Image
                    src="/images/professional/privatisation-coworking-strasbourg.webp"
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
          </div>
          <Partner data={partnerOneLogos} />
        </div>
      </section>
      <section className="projects pt__120 pb__130">
        <div className="container">
          {/* title Start */}
          <SlideDown className="d-flex justify-content-between align-items-center projects__title">
            <h1 className="title">
              Un lieu équipé et modulable pour vos événements professionnels
            </h1>
            {/* <Link href="/spaces#spaces" className="circle mt-5 mt-lg-0">
              <Icon name="arrow-right" />
              <span>En savoir plus</span>
            </Link> */}
          </SlideDown>
          {/* title End */}
          <div className="projects__wapper">
            {professionalData.map(
              ({ categories, subCategories, id, imgSrc, title }) => {
                return (
                  <SlideUp
                    delay={id}
                    key={id}
                    className="projects__wapper_card"
                  >
                    <div className="d-flex flex-column gap-5">
                      <Image
                        src={imgSrc}
                        alt={`${title} - CoworKing Café Anticafé Strasbourg`}
                        width={600}
                        height={400}
                        loading="lazy"
                        quality={85}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div>
                      <div className="d-flex align-items-center"></div>

                      <p className="project__group">{categories}</p>
                      <p className="project__group">{subCategories}</p>
                    </div>
                  </SlideUp>
                );
              },
            )}
          </div>
        </div>
      </section>
      <div className="py__130">
        <section className="about py__130" id="about">
          <div className="container">
            <div className="row justify-content-between about__title">
              <SlideDown>
                <div className="col-lg-10">
                  <div>
                    <h1 className="title">
                      Formats & conditions de privatisation
                    </h1>
                  </div>
                </div>
                <div className="col-lg-2">
                  <div className="about__title_shap position-relative">
                    <img
                      src="/images/banner/Shape.svg"
                      alt="img"
                      className="w-100"
                    />
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
                    <Link href="/about" className="circle">
                      <i className="fa-solid fa-arrow-right"></i>
                      <span>Demande de devis</span>
                    </Link>
                  </div>
                </SlideUp>
              </div>
              <div className="col-xl-4 col-lg-6">
                <SlideUp delay={2}>
                  <div className="about__wapper_center">
                    <img src="/images/about/Rectangle105.webp" alt="reunion" />
                  </div>
                </SlideUp>
              </div>
              <div className="col-xl-3 col-lg-6 mt-5 mt-xl-0">
                <SlideUp delay={3}>
                  <ul className="about__wapper_right">
                    <li>
                      <i className="fa-solid fa-check"></i>
                      <span>Nous proposons plusieurs formats :</span>
                    </li>
                    <li>
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Demi-journée (matin ou après- midi), à partir de 880 €
                        HT
                      </span>
                    </li>
                    <li>
                      <i className="fa-solid fa-check"></i>
                      <span>Journée complète, à partir de 1 490 € HT</span>
                    </li>
                    <li>
                      <i className="fa-solid fa-check"></i>
                      <span>Soirée, à partir de 550 € HT</span>
                    </li>
                  </ul>
                </SlideUp>
              </div>
            </div>
            <h2 className="title mt__100">
              Pourquoi choisir Coworking Café pour votre événement ?
            </h2>
            <p className="title__paragraph">
              Privatiser Coworking Café, c’est faire le choix d’un lieu
              événementiel B2B différent, déjà reconnu pour la qualité de son
              accueil et de son atmosphère. C’est aussi bénéficier :
            </p>
            <ul className="about__wapper_right">
              <li className="">
                d’un espace pensé pour le travail et l’échange, pas simplement
                loué pour l’occasion
              </li>
              <li>
                de l’ADN Anticafé, pionnier du café-coworking, allié à un fort
                ancrage local strasbourgeois
              </li>
              <li>
                d’un cadre chaleureux qui favorise la participation, l’attention
                et les rencontres d’une équipe réactive, habituée à accueillir
                des groupes professionnels{" "}
              </li>
            </ul>
          </div>
        </section>
        <section className="testimonial py__130">
          <div className="container position-relative py__130">
            {/* title Start */}
            <SlideDown className="">
              <h1 className="title text-center">
                Merci pour vos retours! <br /> Parce que vous contribuez à notre
                succès...
              </h1>
            </SlideDown>
            {/* title End */}
            <SlideUp className="testimonial__wapper">
              <Swiper
                onSwiper={(swiper: SwiperType) => (swiperRef.current = swiper)}
                spaceBetween={25}
                breakpoints={{
                  0: {
                    slidesPerView: 1,
                  },
                  768: {
                    slidesPerView: 2,
                  },
                }}
                navigation={{
                  nextEl: ".next-slide",
                  prevEl: ".prev-slide",
                }}
                pagination={{
                  type: "custom",
                  el: ".testimonial-pagination",
                  renderCustom: function (
                    _swiper: SwiperType,
                    current: number,
                    total: number,
                  ) {
                    let html = "";

                    // Calculer les pages à afficher (max 3)
                    let startPage = Math.max(1, current - 1);
                    let endPage = Math.min(total, startPage + 2);

                    // Ajuster si on est à la fin
                    if (endPage - startPage < 2) {
                      startPage = Math.max(1, endPage - 2);
                    }

                    // Ajouter "..." au début si on n'est pas sur les premières pages
                    if (startPage > 1) {
                      html += `<span class='slide-dots slide-dots-ellipsis' data-page='1'>...</span>`;
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      const activeClass =
                        i === current ? "slide-dots-active" : "";
                      html += `<span class='slide-dots ${activeClass}' data-page='${i}'>0${i}</span>`;
                    }

                    // Ajouter "..." à la fin si on n'est pas sur les dernières pages
                    if (endPage < total) {
                      html += `<span class='slide-dots slide-dots-ellipsis' data-page='${total}'>...</span>`;
                    }

                    return html;
                  },
                }}
                loop
                modules={[Navigation, PaginationModule]}
              >
                {testimonialsOneData.map((testimonial, index) => (
                  <SwiperSlide key={index} className="slide">
                    <div className="d-flex gap-2 star">
                      {Array.from({ length: testimonial.stars }).map((_, i) => (
                        <i key={i} className="bi bi-star-fill" />
                      ))}
                    </div>
                    <p className="review">{testimonial.review}</p>
                    <div className="d-flex justify-content-between">
                      <div className="d-flex gap-4 reviewer__info">
                        <Image
                          src={testimonial.reviewer.image}
                          alt={testimonial.reviewer.name}
                          width={60}
                          height={60}
                          loading="lazy"
                          sizes="60px"
                        />
                        <div>
                          <p>{testimonial.reviewer.name}</p>
                          <small>{testimonial.reviewer.position}</small>
                        </div>
                      </div>
                      <div>
                        <Image
                          src={testimonial.quoteImage}
                          alt="quote"
                          width={60}
                          height={60}
                          loading="lazy"
                          sizes="60px"
                        />
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
                <div className="d-flex justify-content-center gap-3 mt-4">
                  <div className="d-flex justify-content-between w-380">
                    <div className="prev-slide slide__nav">
                      <Icon name="arrow-left" />
                    </div>
                    <div className="testimonial-pagination d-flex gap-3"></div>
                    <div className="next-slide slide__nav">
                      <Icon name="arrow-right" />
                    </div>
                  </div>
                </div>
              </Swiper>
            </SlideUp>
            <div className="video">
              <h1 className="title text-center mb-5">
                Pourquoi venir à CoworKing Café ? <br />
                Pour ça !
              </h1>

              <div className="position-relative">
                <Image
                  src="/images/testimonail/anticafé-strasbourg.webp"
                  alt="Vidéo présentation Anticafé CoworKing Café Strasbourg"
                  width={1200}
                  height={675}
                  loading="lazy"
                  quality={85}
                  className="video_thumb"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
                />
                <div
                  onClick={() => setOpen(true)}
                  className="video_icon video-play"
                >
                  <Image
                    src="/images/testimonail/Frame_20.svg"
                    alt="bouton play"
                    width={80}
                    height={80}
                    loading="lazy"
                  />
                </div>
              </div>

              <h4 className="title__paragraph text-center mt-4 py__130">
                Vous souhaitez organiser un événement professionnel à Strasbourg
                dans un lieu chaleureux, fonctionnel et central ? Présentez-nous
                votre projet par email (date, format, nombre de personnes,
                besoins spécifiques). Nous étudierons votre demande et
                reviendrons vers vous avec une proposition adaptée.
              </h4>
              {/* Links to contact */}
              <div className="text-center mt-3 mt-md-5 mb-5">
                <Link
                  href="/contact"
                  className="common__btn me-md-3 mb-3 mb-md-0 d-block d-md-inline-block"
                >
                  <span>Demander un devis</span>
                </Link>
              </div>
            </div>
            <ModalVideo
              channel="youtube"
              youtube={{ mute: 0, autoplay: 0 }}
              isOpen={isOpen}
              videoId="cHfYLa7XE_0"
              onClose={() => setOpen(false)}
            />
          </div>
        </section>
      </div>
      <div className="py__130"></div>
    </div>
  );
};

export default Professional;
