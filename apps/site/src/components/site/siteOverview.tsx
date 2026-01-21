import SlideUp from "../../utils/animations/slideUp";
import Link from "next/link";
import AboutCounter from "./about/aboutCounter";

const SiteOverview = () => {
  return (
    <section className="tools py__130">
      <div className="container">
        <div className="projects__usecase">
          <div className="row align-items-center">
            <SlideUp className="col-lg-6">
              <div className="projects__usecase_content">
                <h3 className="t__54">
                  Agencies use various analytics tools to track and measure
                </h3>
                <p className="pt__50">
                  High-quality, relevant content is essential for engaging and
                  retaining online audiences. Digital marketing agencies often
                  create content strategies, produce blog posts, articles,
                  videos
                </p>
                <p className="para2">
                  And infographics, &amp; distribute them across different
                  online channel to attract and engage customers.
                </p>
                <Link href={"/about"} className="common__btn">
                  <span>Get Started Now</span>
                  <img src="/icons/arrow-up-rignt-black.svg" alt="img" />
                </Link>
              </div>
            </SlideUp>
            <SlideUp delay={2} className="col-lg-6 mt-5 mt-lg-0">
              <div>
                <img
                  src="/images/projects/Frame.png"
                  alt="img"
                  className="projects__usecase_img"
                />
              </div>
            </SlideUp>
          </div>
        </div>
        <AboutCounter />
      </div>
    </section>
  );
};

export default SiteOverview;
