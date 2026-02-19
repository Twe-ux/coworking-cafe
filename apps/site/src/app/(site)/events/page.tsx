import ProjectCard from "@/components/site/projects/projectCard";
import { projectsTwoData } from "@/db/projectsTwoData";
import SlideUp from "@/utils/animations/slideUp";
import Link from "next/link";

const EventsPage = () => {
  return (
    <>
      <div className="container">
        <section className="all__project py__130">
          <div className="container">
            <div className="row">
              <div className="row">
                {projectsTwoData.map(({ categories, id, imgSrc, title }) => (
                  <SlideUp
                    key={id}
                    className={`col-xl-4 col-md-6 mb-5 mb-xl-0`}
                    delay={id}
                  >
                    <ProjectCard
                      categories={categories}
                      imgSrc={imgSrc}
                      title={title}
                    />
                  </SlideUp>
                ))}
              </div>
            </div>
            <SlideUp className="custom__pagination">
              <div className="row">
                <div className="col-12">
                  <ul className="d-flex justify-content-center">
                    <li>
                      <i className="fa-solid fa-arrow-left" />
                    </li>
                    <li>01</li>
                    <li>02</li>
                    <li>03</li>
                    <li>
                      <i className="fa-solid fa-arrow-right" />
                    </li>
                  </ul>
                </div>
              </div>
            </SlideUp>
          </div>
        </section>
      </div>
      <section className="spaces spaces__2 py__130" id="spaces">
        <div className="container position-relative">
          <div className="spaces__wapper spaces__2_wapper">
            <div className="row">
              <div className="service__card services__2_card">
                <Link href="/">
                  {/* <Image
                    src={"/"}
                    alt={`Espace CoworKing Café Anticafé Strasbourg`}
                    width={600}
                    height={400}
                    loading="lazy"
                    quality={85}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  /> */}
                  {/* <h3 className="t__28">{title}</h3> */}
                  <p>tets</p>
                  <div className="d-flex align-items-center">
                    <span>Plus de détails</span>
                    {/* <Icon name="arrow-right" /> */}
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EventsPage;
