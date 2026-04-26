import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { Evenement } from "@/types/evenement";

interface EventCardProps {
  event: Evenement;
}

export function EventCard({ event: e }: EventCardProps) {
  return (
    <article className="rounded-[20px] border border-[var(--line)] bg-white overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr_auto] gap-6 items-center p-[clamp(18px,2.5vw,28px)]">
        {/* Date badge */}
        <div
          className="w-[90px] sm:w-full text-center py-[14px] px-2 rounded-[14px] text-white shrink-0"
          style={{ background: e.color }}
        >
          <div className="font-mono text-[10px] tracking-[0.14em] opacity-85">{e.dayName}</div>
          <div className="font-serif text-[44px] leading-none my-1">{e.day}</div>
          <div className="font-mono text-[10px] tracking-[0.14em] opacity-85">{e.month}</div>
        </div>

        {/* Content */}
        <div>
          <span
            className="inline-flex px-[10px] py-[4px] rounded-full text-[11px] font-mono tracking-[0.1em]"
            style={{ background: `${e.color}22`, color: e.color }}
          >
            {e.tag}
          </span>
          <h3 className="h3 mt-[10px]">{e.title}</h3>
          <p className="text-[14px] text-[var(--gry)] mt-2 leading-[1.5]">{e.desc}</p>
          <div className="flex gap-5 mt-[14px] text-[12.5px] text-[var(--gry)]">
            <span className="flex items-center gap-[6px]">
              <Icon name="clock" size={13} stroke="var(--main)" />
              {e.time}
            </span>
            <span className="flex items-center gap-[6px]">
              <Icon name="people" size={13} stroke="var(--main)" />
              {e.spots} places
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="sm:self-center">
          <Button variant="dark" size="sm">
            S&apos;inscrire
            <Icon name="chevRight" size={14} stroke="#fff" sw={2.2} />
          </Button>
        </div>
      </div>
    </article>
  );
}
