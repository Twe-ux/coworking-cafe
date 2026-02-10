interface ProjectCardProps {
  imgSrc: string;
  title: string;
  categories: string[];
  className?: string;
}

const ProjectCard = ({
  className = "",
  imgSrc,
  title,
  categories,
}: ProjectCardProps) => {
  return (
    <div className={`projects__2_card ${className}`}>
      <img
        src={imgSrc}
        alt={`${title} - CoworKing Café Anticafé Strasbourg`}
        className="w-100"
      />
    </div>
  );
};

export default ProjectCard;
