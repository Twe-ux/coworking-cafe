import ProtectedEmail from "@/components/common/ProtectedEmail";
import { spacesData, spacesDetailsData } from "@/db/spaces/spacesData";
import SlideDown from "@/utils/animations/slideDown";
import SlideUp from "@/utils/animations/slideUp";
import SpaceCard from "./spaceCard";
import SpaceDetails from "./spaceDetails";

const Spaces = () => {
  return (
    <>
      <section className="spaces spaces__2 py__130" id="spaces">
        <div className="container position-relative">
          <SlideDown className="d-flex flex-column gap-5 spaces__title spaces__2_title">
            <h1 className="title text-white">
              Des espaces et des atmosphères en fonction de vos besoins
            </h1>
            <p className="mt-4 mt-lg-0">
              Notre espace de café-coworking à Strasbourg propose plusieurs
              ambiances pour répondre à tous les besoins : un open-space parfait
              pour télétravailler, réviser ou avancer en solo ; et deux salles
              plus privatives — la verrière et l’étage — idéales pour les
              réunions, ateliers, formations ou sessions d’équipe. Ces salles
              offrent davantage de tranquillité et de confidentialité. Quel que
              soit votre projet, vous trouverez l’espace qui vous correspond… et
              l’atmosphère qui vous booste.
            </p>
          </SlideDown>
          {/*  */}
          <div className="spaces__wapper spaces__2_wapper">
            <div className="row">
              {spacesData
                .slice(0, 3)
                .map(({ description, id, imgSrc, title, link }) => (
                  <SlideUp
                    key={id}
                    className="col-xl-4 col-md-6 mb-5 mb-xl-0"
                    delay={id}
                  >
                    <SpaceCard
                      description={description}
                      title={title}
                      imgSrc={imgSrc}
                      link={link}
                      className={id === 2 ? "two" : id === 3 ? "three" : ""}
                    />
                  </SlideUp>
                ))}
            </div>
            <div className="row spaces__2_row">
              <div className="col-12">
                <p>
                  Pour privatiser tout l’établissement, merci de nous contacter
                  par email à{" "}
                  <ProtectedEmail
                    user="strasbourg"
                    domain="coworkingcafe.fr"
                    className="email"
                  />
                </p>
              </div>
            </div>

            {spacesDetailsData.map(
              ({
                id,
                title,
                description,
                subDescription,
                imgSrc,
                counterBox,
                url,
              }) => {
                return (
                  <SpaceDetails
                    key={id}
                    id={id}
                    title={title}
                    description={description}
                    subDescription={subDescription}
                    imgSrc={imgSrc}
                    counterBox={counterBox}
                    url={url}
                  />
                );
              }
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Spaces;
