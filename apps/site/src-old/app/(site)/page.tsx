import AboutOne from "../../components/site/about/aboutOne";
import HomeBlog from "../../components/site/blogs/homeBlog";
import HeroOne from "../../components/site/heros/heroOne";
import ProjectsOne from "../../components/site/projects/projectsOne";
import TestimonialOne from "../../components/site/testimonial/testimonialOne";

const Home = () => {
  return (
    <>
      <HeroOne />
      <AboutOne />
      <ProjectsOne isProjectUseCaseShow={true} />
      <TestimonialOne />
      <HomeBlog className={"py__130"} />
    </>
  );
};

export default Home;
