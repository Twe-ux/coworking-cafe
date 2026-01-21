"use client";
import { testimonialsOneData } from "@/db/testimonialsOneData";
import SlideDown from "@/utils/animations/slideDown";
import SlideUp from "@/utils/animations/slideUp";
import { useEffect, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import VideoTestimonial from "./videoTestimonial";

const TestimonialOne = () => {
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
          handlePaginationClick as EventListener
        );
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      const paginationEl = document.querySelector(".testimonial-pagination");
      if (paginationEl) {
        paginationEl.removeEventListener(
          "click",
          handlePaginationClick as EventListener
        );
      }
    };
  }, []);
  return (
    <section className="testimonial py__130">
      <div className="container position-relative">
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
            onSwiper={(swiper) => (swiperRef.current = swiper)}
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
              renderCustom: function (_swiper, current, total) {
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
                  const activeClass = i === current ? "slide-dots-active" : "";
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
            modules={[Navigation, Pagination]}
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
                    <img
                      src={testimonial.reviewer.image}
                      alt={testimonial.reviewer.name}
                    />
                    <div>
                      <p>{testimonial.reviewer.name}</p>
                      <small>{testimonial.reviewer.position}</small>
                    </div>
                  </div>
                  <div>
                    <img src={testimonial.quoteImage} alt="quote" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
            <div className="d-flex justify-content-center gap-3 mt-4">
              <div className="d-flex justify-content-between w-380">
                <div className="prev-slide slide__nav">
                  <i className="fa-solid fa-arrow-left"></i>
                </div>
                <div className="testimonial-pagination d-flex gap-3"></div>
                <div className="next-slide slide__nav">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            </div>
          </Swiper>
        </SlideUp>

        <VideoTestimonial />
      </div>
    </section>
  );
};

export default TestimonialOne;
