"use client";

import SlideUp from "../../../utils/animations/slideUp";

// Import Swiper styles

import { OffersStudentsDetailsProps } from "../../../db/offersStudents.tsx/offersStudentsData";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const OffersStudentsDetails = ({
  id,
  title,
  description,
  subDescription,
  img,
}: OffersStudentsDetailsProps) => {
  return (
    <section className="tools__concept py__110" id={id}>
      <div className="container">
        <div className="projects__usecase">
          <div className="row align-items-center">
            <SlideUp className="col-lg-6">
              <div className="projects__usecase_content">
                <h3 className="t__54">{title}</h3>
                <p className="pt__50">{description}</p>
              </div>
            </SlideUp>
            <div className="students__carousel">
              <img
                src={img}
                alt={`${title} - image ${id}`}
                className="students__carousel_img"
              />
            </div>
          </div>
        </div>
        <p className="para2">{subDescription}</p>
      </div>
    </section>
  );
};

export default OffersStudentsDetails;
