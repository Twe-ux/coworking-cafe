import PageTitle from "@/components/site/pageTitle";
import Partner from "@/components/site/partner";
import PricingTable from "@/components/site/pricing/pricingTable";
import { partnerTwoLogos } from "@/db/partnerOneLogos";

const Pricing = () => {
  return (
    <>
      <PageTitle title={"Pricing Plan"} />
      <section className="pricing py__130">
        <div className="container">
          <PricingTable />
          <Partner data={partnerTwoLogos} className={"bg-transparent"} />
        </div>
      </section>
    </>
  );
};

export default Pricing;
