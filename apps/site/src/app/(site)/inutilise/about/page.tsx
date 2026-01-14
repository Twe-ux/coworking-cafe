import AboutOne from "@/components/site/about/aboutOne";
import HomeBlog from "@/components/site/blogs/homeBlog";
import PageTitle from "@/components/site/pageTitle";
import ProjectsOne from "@/components/site/projects/projectsOne";
import TestimonialTwo from "@/components/site/testimonial/testimonialTwo";

const About = () => {
  return (
    <>
      <PageTitle title={"About Us"} />
      <AboutOne />
      <ProjectsOne />
      <TestimonialTwo />
      <HomeBlog />
    </>
  );
};

export default About;
