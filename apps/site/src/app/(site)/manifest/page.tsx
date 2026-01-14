import ManifestDetails from "@/components/site/manifest/manifestDetails";
import PageTitle from "@/components/site/pageTitle";
import { manifestDetailsData } from "@/db/manifest/manifestData";

const ManifestPage = () => {
  return (
    <>
      <PageTitle title="Notre manifeste" />
      <section
        className="manifest__section spaces spaces__2 py__90"
        id="spaces"
      >
        <div className="container position-relative pb__130">
          <div className="d-flex justify-content-center mantra gap-2 ">
            <h3 className="mantra">Le café motive.</h3>
            {""}
            <h3 className="mantra">L’humain relie.</h3>
            {""}
            <h3 className="mantra">Vous faites le reste.</h3>
          </div>
          <div className="spaces__wapper spaces__2_wapper ">
            {manifestDetailsData.map(
              ({ id, title, description, subDescription, img }) => {
                return (
                  <ManifestDetails
                    key={id}
                    id={id}
                    title={title}
                    description={description}
                    subDescription={subDescription}
                    img={img}
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

export default ManifestPage;
