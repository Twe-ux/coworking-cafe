import { projectsTwoData } from "@/db/projectsTwoData";
import SlideUp from "@/utils/animations/slideUp";
import ProjectCard from "./projectCard";

const ProjectsThree = () => {
  return (
    <section className="all__project py__130">
      <div className="container">
        <h4>L’équipe : six personnalités, un même lieu à faire vivre</h4>
        <div className="row">
          <div className="row">
            {projectsTwoData.map(({ categories, id, imgSrc, title }) => (
              <SlideUp
                key={id}
                className={`col-xl-4 col-md-6 mb-5 mb-xl-0`}
                delay={id}
              >
                <ProjectCard
                  categories={categories}
                  imgSrc={imgSrc}
                  title={title}
                />
              </SlideUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsThree;
