import { servicesTwoData } from "../../../db/servicesTwoData";
import SlideDown from "../../../utils/animations/slideDown";
import SlideUp from "../../../utils/animations/slideUp";
import Link from "next/link";
import VideoTestimonial from "../testimonial/videoTestimonial";
import ServiceCard from "./serviceCard";

const ServicesTwo = () => {
  return (
    <section className="services services__2 py__130">
      <div className="container position-relative">
        <SlideDown className="d-lg-flex justify-content-between align-items-center services__title services__2_title">
          <h1 className="title text-white">
            Our service solve your any business problem
          </h1>
          <p className="mt-4 mt-lg-0">
            In order to scale new customer acquisition and retention for
            e-commerce brands, we work across the entire customer journey. Our
            team has a successful.
          </p>
        </SlideDown>
        {/*  */}
        <div className="services__wapper services__2_wapper">
          <div className="row">
            {servicesTwoData
              .slice(0, 3)
              .map(({ description, id, imgSrc, title }) => (
                <SlideUp
                  key={id}
                  className="col-xl-4 col-md-6 mb-5 mb-xl-0"
                  delay={id}
                >
                  <ServiceCard
                    description={description}
                    title={title}
                    imgSrc={imgSrc}
                    className={id === 2 ? "two" : id === 3 ? "three" : ""}
                  />
                </SlideUp>
              ))}
          </div>
          <div className="row services__2_row">
            <div className="col-12">
              <p>
                Do you want to see our all services? Just
                <Link href="/services"> click here</Link>
              </p>
            </div>
          </div>
          <VideoTestimonial />
        </div>
      </div>
    </section>
  );
};

export default ServicesTwo;
