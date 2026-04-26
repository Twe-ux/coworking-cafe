import { FAQ } from "@/types/pricing";

export function FaqSection() {
  return (
    <section className="section section-dark">
      <div className="wrap">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-[clamp(24px,4vw,60px)]">
          <div>
            <div className="eyebrow mb-3" style={{ color: "var(--btn)" }}>
              — Questions fréquentes
            </div>
            <h2 className="h2 text-white">
              On vous{" "}
              <em className="not-italic text-[var(--btn)]">répond.</em>
            </h2>
          </div>

          <div className="flex flex-col">
            {FAQ.map((item, i) => (
              <div
                key={item.q}
                className={`pb-[18px] ${i < FAQ.length - 1 ? "mb-[18px] border-b border-white/10" : ""}`}
              >
                <div className="font-serif text-[18px] text-white">{item.q}</div>
                <div className="text-[14px] text-white/75 mt-2 leading-[1.55]">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
