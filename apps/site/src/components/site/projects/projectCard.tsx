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
      <div className="position-relative w-100" style={{ aspectRatio: '1/1' }}>
        <Image
          src={imgSrc}
          alt={`${title} - CoworKing Café Anticafé Strasbourg`}
          fill
          loading="lazy"
          quality={85}
          style={{ objectFit: 'cover' }}
          className="rounded-3"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
    </div>
  );
};

export default ProjectCard;
