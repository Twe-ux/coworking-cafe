import Image from "next/image";

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
}: ProjectCardProps) => {
  return (
    <div className={`projects__2_card ${className}`}>
      <Image
        src={imgSrc}
        alt={`${title} - CoworKing Café Anticafé Strasbourg`}
        width={600}
        height={400}
        loading="lazy"
        quality={85}
        className="w-100"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

export default ProjectCard;
