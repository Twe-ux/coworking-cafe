import Image from "next/image";
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
        <Image
          src={imgSrc}
          alt={`${title} - Espace CoworKing Café Anticafé Strasbourg`}
          width={600}
          height={400}
          loading="lazy"
          quality={85}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
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
