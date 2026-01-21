import { conceptData } from "@/db/concept/conceptData";
import SlideDown from "@/utils/animations/slideDown";
import SlideUp from "@/utils/animations/slideUp";
import Link from "next/link";

const ConceptDetails = () => {
  return (
    <section className="concept__bg py__130" id="concept">
      <div className="container position-relative ">
        {/* Title */}
        <SlideDown className="d-lg-flex justify-content-between align-items-center concept__title">
          <h5 className="title">Comment ça marche ?</h5>
          <div className="d-flex gap-3">
            <Link href={"/spaces#spaces"} className="common__btn mt-4 mt-lg-0">
              <span>Nos espaces</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
            <Link
              href={"/pricing#pricing"}
              className="common__btn mt-4 mt-lg-0"
            >
              <span>Nos tarifs</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </SlideDown>
        <div className="concept__wapper">
          <div className="concept__wapper_list">
            {conceptData.map((concept) => (
              <SlideUp delay={concept.id} key={concept.id}>
                <div className="concepts__name">
                  <sup>{`0${concept.id}`}</sup>
                  {concept.title}
                </div>

                <p className="describe">{concept.description}</p>
              </SlideUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConceptDetails;
