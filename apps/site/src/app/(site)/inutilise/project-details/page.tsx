import PageTitle from "../../../../components/site/pageTitle";
import SlideUp from "../../../../utils/animations/slideUp";

const ProjectDetails = () => {
  return (
    <>
      <PageTitle title={"Project Details"} />
      <article className="project__details py__130">
        <div className="container">
          <SlideUp>
            <h1 className="title title__black text-center">
              Green Minimal &amp; 3d Design
            </h1>
          </SlideUp>
          <SlideUp>
            <ul className="project__info">
              <li>
                <p>Client:</p>
                <small>John Smith</small>
              </li>
              <li>
                <p>Category:</p>
                <small>UX Design</small>
              </li>
              <li>
                <p>Start Date:</p>
                <small>12 January, 23</small>
              </li>
              <li>
                <p>End Date:</p>
                <small>20 January, 23</small>
              </li>
              <li>
                <p>Budget:</p>
                <small>$4923</small>
              </li>
              <li>
                <p>Location:</p>
                <small>Vieana Road, NY America</small>
              </li>
            </ul>
          </SlideUp>
          <div className="first__para">
            <img
              src="/images/projects/project-3.webp"
              alt="img"
              className="w-100"
            />
            <h4 className="t__28">The challenge</h4>
            <p>
              Content is king in the digital world. Agencies produce
              high-quality content, including blog posts, videos, infographics,
              and more, to engage and educate the target audience. Content
              marketing builds trust and authority for the brand. Agencies
              manage and grow a brand's presence on social media platforms such
              as Facebook, Twitter, LinkedIn, and Instagram.
            </p>
            <p>
              The core mission of our organization is to help businesses achieve
              their marketing objectives through digital channels and drive
              growth and revenue. Marketing has become increasingly important in
              recent years, with businesses leveraging a range of digital
              channels such as social media and mobile apps to reach and engage
              with customers.
            </p>
          </div>
          <div className="second__para pt__50">
            <div className="row justify-content-between align-items-center">
              <SlideUp className="col-md-5">
                <div>
                  <h4 className="t__28">
                    Our premium detail package makes your vehicle look &amp;
                    smell like new again,
                  </h4>
                  <ul>
                    <li>Online Booking System now</li>
                    <li>Special Offers and Discounts for you!</li>
                    <li>Sustainability Initiatives</li>
                  </ul>
                </div>
              </SlideUp>
              <SlideUp className="col-md-6 mt-4 mt-md-0">
                <img
                  src="/images/projects/project-2.png"
                  alt="img"
                  className="w-100 rounded-3"
                />
              </SlideUp>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default ProjectDetails;
