interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
  underDescription: string;
}

const MemberProgramCard = ({
  icon,
  title,
  description,
  underDescription,
  className = "",
}: ServiceCardProps) => {
  return (
    <div className={`member__card members__2_card ${className}`}>
      <div className="icon">{icon}</div>
      <h3 className="t__28">{title}</h3>
      <p>{description}</p>
      <div className="d-flex align-items-center">
        <span>{underDescription}</span>
      </div>
    </div>
  );
};

export default MemberProgramCard;
