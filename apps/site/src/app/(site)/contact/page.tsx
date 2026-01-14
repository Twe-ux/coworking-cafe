import ContactInfo from "@/components/site/contactInfo";
import GoogleMap from "@/components/site/googleMap";
import PageTitle from "@/components/site/pageTitle";

const Contact = () => {
  return (
    <>
      <PageTitle title={"Contactez-nous"} />
      <ContactInfo />
      <GoogleMap />
    </>
  );
};

export default Contact;
