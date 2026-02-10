import { partnerTwoLogos } from "../../../db/partnerOneLogos";
import SlideDown from "../../../utils/animations/slideDown";
import SlideUp from "../../../utils/animations/slideUp";
import Image from "next/image";
import Link from "next/link";
import Partner from "../partner";

const AboutTwo = () => {
  return (
    <section className="about about__2 py__130">
      <div className="container">
        <SlideDown>
          <div className="row justify-content-between about__title">
            <div className="col-lg-10">
              <div>
                <h1 className="title about__2_title">
                  Agencies use various analytics tools to track and measure
                  performance of online marketing efforts.
                </h1>
              </div>
            </div>
            <div className="col-lg-2">
              <div
                className="about__title_shap"
                style={{ width: "100%", height: "100%", position: "relative" }}
              >
                <Image
                  src="/images/banner/Shape.svg"
                  alt="Forme décorative"
                  width={100}
                  height={100}
                  loading="lazy"
                  className="w-100"
                />
              </div>
            </div>
          </div>
        </SlideDown>
        <div className="row justify-content-between about__wapper about__2_wapper">
          <div className="col-lg-6">
            <SlideUp>
              <div className="about__wapper_center">
                <Image
                  src="/images/about/OBJECTS1.png"
                  alt="Illustration services digitaux"
                  width={600}
                  height={600}
                  loading="lazy"
                  quality={85}
                />
              </div>
            </SlideUp>
          </div>
          <div className="col-lg-6">
            <SlideUp delay={2}>
              <div className="about__wapper_left about__2_left">
                <Link
                  href="/about"
                  className="circle circle__black about__2_circle"
                >
                  <Image
                    src="/icons/arrow-up-rignt-black.svg"
                    alt="Icône lien externe"
                    width={20}
                    height={20}
                    loading="lazy"
                  />
                  <span>More About Us</span>
                </Link>
                <p className="one">
                  High-quality, relevant content is essential for engaging and
                  retaining online audiences. Digital marketing agencies often
                  create content strategies, produce blog posts, articles,
                  videos
                </p>
                <p>
                  And infographics, &amp; distribute them across different
                  online channel to attract and engage customers.
                </p>
              </div>
            </SlideUp>
          </div>
        </div>
        <Partner data={partnerTwoLogos} className={"bg-white"} />
      </div>
    </section>
  );
};

export default AboutTwo;
