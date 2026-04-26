import { StarRating } from "@/components/ui/StarRating";
import { Avatar } from "@/components/ui/Avatar";
import { TESTIMONIALS } from "@/types/space";

export function TestimonialsSection() {
  return (
    <section className="section section-cream">
      <div className="wrap">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <div className="eyebrow mb-3">— 03 · Témoignages</div>
            <h2 className="h2">
              Ce qu&apos;ils en <em className="accent">disent</em>
            </h2>
          </div>
          <div className="flex items-center gap-[14px]">
            <StarRating count={5} size={16} />
            <span className="text-[14px] font-medium">
              4.9{" "}
              <span className="text-[var(--gry)] text-[13px]">
                · 280 avis Google
              </span>
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-[20px] border border-[var(--line)] bg-white p-[22px] flex flex-col"
            >
              <StarRating count={5} size={13} />
              <blockquote className="font-serif text-[17px] leading-[1.45] mt-[14px] flex-1">
                «&nbsp;{t.quote}&nbsp;»
              </blockquote>
              <div className="flex items-center gap-[10px] mt-[18px]">
                <Avatar name={t.name} />
                <div>
                  <div className="text-[13px] font-medium">{t.name}</div>
                  <div className="text-[11px] text-[var(--gry)] mt-[2px]">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
