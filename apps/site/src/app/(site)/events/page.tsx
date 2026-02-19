import PageTitle from "@/components/site/PageTitle";
import ProjectCard from "@/components/site/projects/projectCard";
import { eventsData } from "@/db/events/enventsData";
import SlideDown from "@/utils/animations/slideDown";
import SlideUp from "@/utils/animations/slideUp";
import Image from "next/image";
import Link from "next/link";

const EventsPage = () => {
  return (
    <>
      <PageTitle title={"Événements"} />
      {/* events a venir */}
      <section className="all__project pt__130">
        <div className="container">
          <div className="row">
            <div className="row">
              {eventsData.map(({ categories, id, imgSrc, title }) => (
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
        </div>
      </section>
      {/* description */}
      <section className="spaces spaces__2 py__130" id="spaces">
        <div className="container position-relative">
          <SlideDown className="">
            <h1 className="title text-white">
              Si toi aussi tu veux organiser un événement chez nous...
            </h1>
          </SlideDown>
          <section className="tools__concept py__90 ">
            <div className="container">
              <div className="projects__usecase">
                <div className="row align-items-center">
                  <SlideUp className="col-lg-6">
                    <div className="projects__usecase_content">
                      <p className="">
                        Vous cherchez un lieu chaleureux, central et fonctionnel
                        pour organiser un événement ?
                      </p>
                      <p className="mt-4">
                        Coworking Café by Anticafé accueille aussi ateliers,
                        formations, conférences, rencontres professionnelles,
                        groupes de parole, lancements de produits ou points
                        boutiques, en format public ou privé.
                      </p>
                      <p className="mt-4">
                        Nos espaces sont modulables, équipés et pensés pour
                        favoriser les échanges, dans une ambiance conviviale et
                        propice aux rencontres. Que ce soit pour un événement
                        ponctuel ou récurrent, nous étudions les demandes avec
                        attention afin de proposer un cadre adapté à votre
                        format.
                      </p>

                      <p className="mt-4">
                        👉 Contactez-nous par email pour nous présenter votre
                        projet et connaître les conditions de mise à disposition
                        de nos espaces.
                      </p>

                      <Link href="#" className="common__btn mt-5  ">
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
                      <Image
                        src="/images/events/organiser-atelier-evenement-strasbourg.webp"
                        alt="CoworKing Café Anticafé Strasbourg"
                        width={800}
                        height={600}
                        loading="lazy"
                        quality={85}
                        className="spaces__carousel_img rounded-3"
                        sizes="(max-width: 991px) 100vw, 50vw"
                      />
                    </div>
                  </SlideUp>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  );
};

export default EventsPage;
