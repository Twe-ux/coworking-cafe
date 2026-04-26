import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";

interface FeatureCardProps {
  icon: IconName;
  title: string;
  desc: string;
}

export function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="card-glass">
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-[14px]"
        style={{ background: "rgba(242,211,129,0.18)" }}
      >
        <Icon name={icon} size={17} stroke="var(--btn)" />
      </div>
      <div className="font-serif text-[22px] text-white">{title}</div>
      <div className="text-[12.5px] text-white/70 mt-1">{desc}</div>
    </div>
  );
}
