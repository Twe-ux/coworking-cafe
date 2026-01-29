import ProtectedEmail from "../../../components/common/ProtectedEmail";
import PageTitle from "../../../components/site/PageTitle";
import PricingMeetingRoom from "../../../components/site/pricing/pricingMeetingRoom";
import PricingOpenSpace from "../../../components/site/pricing/pricingOpenSpace";

const Pricing = () => {
  return (
    <>
      <PageTitle title={"Nos tarifs"} />
      <section className="pricing py__130" id="pricing">
        <div className="container">
          <PricingOpenSpace />
          <PricingMeetingRoom />
          <h2 className="pricing__title pt__50">Tarif Privatisation</h2>
          <h6>
            Pour privatiser tout l'établissement, merci de faire votre demande
            par mail à{" "}
            <ProtectedEmail
              user="strasbourg"
              domain="coworkingcafe.fr"
              className="email"
            />
          </h6>
        </div>
      </section>
    </>
  );
};

export default Pricing;
