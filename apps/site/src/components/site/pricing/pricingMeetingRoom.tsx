import { pricingDataMeetingRoom } from "../../../db/pricingData";
import SlideUp from "../../../utils/animations/slideUp";
import { Icon } from "@/components/common/Icon";
import Link from "next/link";

const PricingMeetingRoom = () => {
  return (
    <>
      <h2 className="pricing__title pt__50">Tarifs des salles de réunion</h2>
      <div className="row ">
        {pricingDataMeetingRoom.map((plan, index) => (
          <SlideUp
            key={index}
            className="col-xl-3 col-md-6 mb-4 mb-xl-0"
            delay={index}
          >
            <div className="pricing__band">
              <h3>{plan.space}</h3>
              <div className="pricing__card meeeting-room">
                <div className="text-center pricing__card_title">
                  <h6>{plan.title}</h6>
                  <div className="d-flex justify-content-center">
                    <h1 className="t__54">{plan.priceTTC}</h1>
                    <sup>TTC</sup>
                  </div>
                  <p>{plan.duration}</p>
                </div>
                <span className="border__full" />
                <ul>
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <span />
                      <p>{feature}</p>
                    </li>
                  ))}
                </ul>
                <Link href={"/booking"} className="common__btn">
                  <span>Réserver</span>
                  <Icon name="arrow-right" />
                </Link>
              </div>
            </div>
          </SlideUp>
        ))}
      </div>
    </>
  );
};

export default PricingMeetingRoom;
