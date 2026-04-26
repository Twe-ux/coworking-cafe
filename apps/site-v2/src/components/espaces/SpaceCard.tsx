import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { Space } from "@/types/space";

interface SpaceCardProps {
  space: Space;
  index: number;
}

export function SpaceCard({ space, index }: SpaceCardProps) {
  const isEven = index % 2 === 0;

  return (
    <article
      id={space.href.split("#")[1]}
      className="rounded-[20px] border border-[var(--line)] bg-white overflow-hidden"
    >
      <div
        className={`grid grid-cols-1 md:grid-cols-[1fr_1.2fr] ${
          isEven ? "" : "md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1"
        }`}
      >
        {/* Colored panel */}
        <div
          className="min-h-[300px] md:min-h-[340px] p-[clamp(20px,3vw,32px)] flex flex-col justify-between relative overflow-hidden"
          style={{ background: space.color, color: "#fff" }}
        >
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] tracking-[0.14em] opacity-70">
              0{index + 1} / 04
            </span>
            <span className="inline-flex items-center px-[12px] py-[6px] rounded-full bg-black/20 text-[11px] font-mono tracking-[0.1em] uppercase text-white/90">
              {space.tag}
            </span>
          </div>

          {/* Emoji watermark */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[96px] leading-none opacity-[0.22] pointer-events-none select-none"
            aria-hidden="true"
          >
            {space.emoji}
          </div>

          <div className="relative">
            <div
              className="font-serif leading-[1.02] tracking-[-0.02em]"
              style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
            >
              {space.name}
            </div>
            <div className="text-[13px] opacity-85 mt-2">
              {space.cap} · dès {space.price}€/h
            </div>
          </div>
        </div>

        {/* Content panel */}
        <div className="p-[clamp(22px,3vw,40px)] flex flex-col">
          <div className="eyebrow">— Espace 0{index + 1}</div>
          <p className="text-[var(--body)] leading-[1.55] my-3 text-[clamp(15px,1.3vw,17px)]">
            {space.desc}
          </p>

          {/* Feature list */}
          <ul className="flex flex-col gap-[10px] mb-6 list-none p-0 m-0">
            {space.details.map((d) => (
              <li key={d} className="flex items-center gap-[10px] text-[13.5px]">
                <Icon name="check" size={14} stroke={space.color} sw={2.5} />
                {d}
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-[var(--line)] flex justify-between items-center">
            <div>
              <span className="font-serif text-[28px] leading-none">
                {space.price}
              </span>
              <span className="text-[13px] text-[var(--gry)] ml-1">€ / heure</span>
            </div>
            <Link href="/booking">
              <Button variant="dark" size="sm">
                Réserver
                <Icon name="chevRight" size={14} stroke="#fff" sw={2.2} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
