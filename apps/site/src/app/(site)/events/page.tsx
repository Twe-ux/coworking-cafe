import PageTitle from "@/components/site/PageTitle";
import EventsCard from "@/components/site/events/EventsCard";
import SlideDown from "@/utils/animations/slideDown";
import SlideUp from "@/utils/animations/slideUp";
import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@coworking-cafe/database";

async function getUpcomingEvents() {
  await connectDB();

  const events = await Event.find({
    status: "published",
    date: { $gte: new Date().toISOString().split("T")[0] },
  })
    .sort({ date: 1, startTime: 1 })
    .limit(12)
    .lean();

  return events.map((event) => ({
    ...event,
    _id: event._id.toString(),
    createdBy: event.createdBy?.toString(),
    createdAt: event.createdAt?.toString(),
    updatedAt: event.updatedAt?.toString(),
  }));
}

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <>
      <PageTitle title={"Événements"} />
      {/* Events à venir */}
      <section className="all__project pt__130">
        <div className="container">
          <div className="row">
            {events.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p className="text-muted">Aucun événement à venir pour le moment.</p>
              </div>
            ) : (
              events.map((event, index) => (
                <SlideUp
                  key={event._id}
                  className="col-xl-4 col-md-6 mb-5"
                  delay={index + 1}
                >
                  <EventsCard
                    slug={event.slug}
                    title={event.title}
                    shortDescription={event.shortDescription}
                    date={event.date}
                    startTime={event.startTime}
                    category={event.category}
                    imgSrc={event.imgSrc}
                    imgAlt={event.imgAlt}
                    location={event.location}
                    price={event.price}
                    registrationType={event.registrationType}
                    externalLink={event.externalLink}
                    maxParticipants={event.maxParticipants}
                    currentParticipants={event.currentParticipants}
                  />
                </SlideUp>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Description */}
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

                      <Link href="/contact" className="common__btn mt-5">
                        <span>Nous contacter</span>
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
}

// Revalidate every hour
export const revalidate = 3600;

