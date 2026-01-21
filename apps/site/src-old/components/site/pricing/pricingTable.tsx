import { pricingData } from "../../../db/pricingData";
import SlideUp from "../../../utils/animations/slideUp";
import Link from "next/link";

const PricingTable = () => {
  return (
    <div className="row pt__50">
      {pricingData.map((plan, index) => (
        <SlideUp
          key={index}
          className="col-xl-3 col-md-6 mb-4 mb-xl-0"
          delay={index}
        >
          <div className="pricing__card">
            <div className="text-center pricing__card_title">
              <h6>{plan.title}</h6>
              <h1 className="t__54">{plan.priceTTC}</h1>
              <p>Per year</p>
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
            <Link href={"/pricing"} className="common__btn">
              <span>Get Started</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </SlideUp>
      ))}
    </div>
  );
};

export default PricingTable;
