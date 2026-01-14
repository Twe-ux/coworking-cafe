import Link from "next/link";

interface SpaceCardProps {
  imgSrc: string;
  title: string;
  description: string;
  className?: string;
  link: string;
}

const SpaceCard = ({
  imgSrc,
  title,
  description,
  link,
  className = "",
}: SpaceCardProps) => {
  return (
    <div className={`service__card services__2_card ${className}`}>
      <Link href={link}>
        <img src={imgSrc} alt={title} />
        <h3 className="t__28">{title}</h3>
        <p>{description}</p>
        <div className="d-flex align-items-center">
          <span>Plus de détails</span>
          <i className="fa-solid fa-arrow-right"></i>
        </div>
      </Link>
    </div>
  );
};

export default SpaceCard;
