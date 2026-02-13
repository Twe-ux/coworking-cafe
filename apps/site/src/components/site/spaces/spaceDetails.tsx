"use client";

import { SpacesDetailsProps } from "../../../db/spaces/spacesData";
import SlideUp from "../../../utils/animations/slideUp";
import Image from "next/image";
import Link from "next/link";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import SpaceCounter from "./spaceCounter";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const SpaceDetails = ({
  id,
  title,
  description,
  subDescription,
  imgSrc,
  counterBox,
  url,
}: SpacesDetailsProps) => {
  // Filtrer les images valides (qui ont un img défini)
  const validImages = imgSrc.filter(
    (item): item is { id: number; img: string } => !!item.img,
  );

  return (
    <section className="tools__concept py__110 " id={id}>
      <div className="container">
        <div className="projects__usecase">
          <div className="row align-items-center">
            <SlideUp className="col-lg-6">
              <div className="projects__usecase_content">
                <h3 className="t__54">{title}</h3>
                <p className="pt__50">{description}</p>
                <p className="para2">{subDescription}</p>
                <Link href={url} className="common__btn">
                  <span>Réserver</span>
                  <Image
                    src="/icons/arrow-up-rignt-black.svg"
                    alt="Icône lien externe"
                    width={20}
                    height={20}
                    loading="lazy"
                  />
                </Link>
              </div>
            </SlideUp>
            <SlideUp delay={2} className="col-lg-6 mt-5 mt-lg-0">
              <div className="spaces__carousel">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={0}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  className="spaces-swiper"
                >
                  {validImages.map((item) => (
                    <SwiperSlide key={item.id}>
                      <Image
                        src={item.img}
                        alt={`${title} - CoworKing Café Anticafé Strasbourg`}
                        width={800}
                        height={600}
                        loading="lazy"
                        quality={85}
                        className="spaces__carousel_img"
                        sizes="(max-width: 991px) 100vw, 50vw"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </SlideUp>
          </div>
        </div>
        <div className="">
          <SpaceCounter counterBox={counterBox} />
        </div>
      </div>
    </section>
  );
};

export default SpaceDetails;
