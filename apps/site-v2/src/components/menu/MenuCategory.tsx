import { Icon } from "@/components/ui/Icon";

interface MenuCategoryProps {
  n: string;
  title: string;
  tag: string;
  included: boolean;
  dark: boolean;
  items: ReadonlyArray<readonly [string, string]>;
  background: string;
}

export function MenuCategory({ n, title, tag, included, dark, items, background }: MenuCategoryProps) {
  return (
    <section className="section" style={{ background }}>
      <div className="wrap">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-7">
          <div>
            <div
              className="eyebrow mb-3"
              style={{ color: dark ? "var(--btn)" : "var(--main)" }}
            >
              — {n} · {tag}
            </div>
            <h2 className="h2" style={{ color: dark ? "#fff" : "var(--body)" }}>
              {title}
            </h2>
          </div>
          {included ? (
            <span
              className="inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-full text-[11px] font-mono tracking-[0.1em]"
              style={{
                background: dark ? "rgba(242,211,129,0.18)" : "rgba(65,121,114,0.1)",
                color: dark ? "var(--btn)" : "var(--main)",
              }}
            >
              <Icon name="check" size={12} stroke="currentColor" sw={2.5} />
              Inclus
            </span>
          ) : (
            <span className="inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-full bg-[var(--btn)] text-[11px] font-mono tracking-[0.1em] text-[#1A1A1A]">
              <Icon name="cookie" size={12} stroke="#1A1A1A" />
              En supplément
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
          {items.map(([name, desc]) => (
            <div
              key={name}
              className="p-[18px] rounded-[16px]"
              style={{
                background: dark ? "rgba(255,255,255,0.04)" : "#fff",
                border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--line)",
              }}
            >
              <div className="font-serif text-[18px]" style={{ color: dark ? "#fff" : "var(--body)" }}>
                {name}
              </div>
              <div
                className="text-[12.5px] mt-[6px] leading-[1.5]"
                style={{ color: dark ? "rgba(255,255,255,0.65)" : "var(--gry)" }}
              >
                {desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
