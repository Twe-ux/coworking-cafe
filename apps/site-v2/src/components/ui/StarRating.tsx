import { Icon } from "@/components/ui/Icon";

interface StarRatingProps {
  count?: number;
  size?: number;
}

export function StarRating({ count = 5, size = 13 }: StarRatingProps) {
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: count }).map((_, i) => (
        <Icon key={i} name="star" size={size} fill="var(--btn)" stroke="var(--btn)" />
      ))}
    </div>
  );
}
