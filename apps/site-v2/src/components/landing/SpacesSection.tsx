import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { SPACES } from "@/types/space";

export function SpacesSection() {
  return (
    <section className="section section-cream">
      <div className="wrap">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-[clamp(24px,4vw,60px)] mb-8">
          <div>
            <div className="eyebrow mb-3">— 01 · Espaces</div>
            <h2 className="h2">
              Choisissez votre{" "}
              <em className="accent">ambiance</em>
            </h2>
          </div>
          <p className="lead text-[var(--gry)] self-end max-w-[580px]">
            Quatre espaces pensés pour des usages différents — du deep-work en
            solo au brainstorm d&apos;équipe. Réservables à l&apos;heure, à la journée,
            à la semaine ou au mois.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
          {SPACES.map((space, i) => (
            <Link
              key={space.key}
              href={space.href}
              className="no-underline text-inherit group"
            >
              <div className="rounded-[20px] border border-[var(--line)] bg-white overflow-hidden flex flex-col h-full transition-shadow hover:shadow-md">
                {/* Colored header */}
                <div
                  className="h-[170px] relative flex items-end p-4"
                  style={{ background: space.color }}
                >
                  <span className="absolute top-[14px] left-4 font-mono text-[10px] text-white/70 tracking-[0.14em]">
                    0{i + 1}
                  </span>
                  <div
                    className="absolute top-[10px] right-[10px] text-[48px] opacity-35 leading-none"
                    aria-hidden="true"
                  >
                    {space.emoji}
                  </div>
                  <div className="font-serif text-[26px] text-white leading-tight">
                    {space.name}
                  </div>
                </div>

                {/* Content */}
                <div className="p-[18px] flex flex-col flex-1">
                  <p className="text-[13px] text-[var(--gry)] leading-[1.5] flex-1">
                    {space.desc}
                  </p>
                  <div className="flex justify-between items-center mt-[14px] pt-[12px] border-t border-[var(--line)]">
                    <span className="text-[14px] font-medium">
                      dès {space.price}€
                      <span className="text-[var(--gry)] font-normal">/h</span>
                    </span>
                    <Icon name="chevRight" size={14} stroke="var(--main)" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
