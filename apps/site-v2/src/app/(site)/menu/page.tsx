import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Menu boissons — CoworKing Café Strasbourg",
  description:
    "+40 boissons incluses dans tous les forfaits. Cafés spécialité, thés premium, boissons froides. Snacks et pâtisseries maison en supplément.",
  openGraph: {
    title: "Menu +40 boissons — CoworKing Café Strasbourg",
    description:
      "Cafés spécialité, thés Kusmi et Dammann, cold brew, matcha latte. Tout inclus dans le prix de votre coworking.",
  },
};

const STATS = ["+40", "4,9", "100%", "0€"] as const;
const STAT_LABELS = ["Boissons", "Note Google", "Fait maison", "Sup. conso"] as const;

const CAT = [
  {
    n: "01",
    title: "Cafés spécialité",
    tag: "Barista",
    included: true,
    dark: false,
    items: [
      ["Espresso", "Intense, notes cacao · 7g"],
      ["Ristretto", "Court, puissant"],
      ["Americano", "Allongé chaud"],
      ["Flat white", "Lait texturé 160ml"],
      ["Cappuccino", "Mousse dense"],
      ["Latte macchiato", "Couches lait & café"],
      ["Cortado", "Ratio 1:1"],
      ["Mocha", "Cacao amer + lait"],
    ],
  },
  {
    n: "02",
    title: "Thés & infusions",
    tag: "Kusmi, Dammann",
    included: true,
    dark: true,
    items: [
      ["Thé vert Sencha", "Japon, délicat"],
      ["Earl Grey", "Bergamote"],
      ["Chaï latte", "Épices, lait chaud"],
      ["Matcha latte", "Poudre cérémoniale"],
      ["Rooibos vanille", "Sans théine"],
      ["Infusion menthe", "Feuilles fraîches"],
      ["Tisane verveine", "Relax"],
      ["Oolong", "Semi-oxydé"],
    ],
  },
  {
    n: "03",
    title: "Boissons froides",
    tag: "Rafraîchissants",
    included: true,
    dark: false,
    items: [
      ["Cold brew", "12h d'extraction"],
      ["Iced latte", "Café + lait + glace"],
      ["Limonade maison", "Citron, basilic"],
      ["Kombucha", "Fermenté · gingembre"],
      ["Matcha tonic", "Matcha + eau pétillante"],
      ["Smoothie", "Fruits de saison"],
      ["Eau aromatisée", "Concombre-menthe"],
      ["Jus frais", "Pomme ou orange"],
    ],
  },
  {
    n: "04",
    title: "Snacks & sucré",
    tag: "Fait maison",
    included: false,
    dark: false,
    items: [
      ["Cookie chocolat", "3,50 €"],
      ["Banana bread", "4 €"],
      ["Granola maison", "5 €"],
      ["Tartine avocat", "7 €"],
      ["Croque-monsieur", "8,50 €"],
      ["Salade du jour", "11 €"],
    ],
  },
] as const;

export default function MenuPage() {
  return (
    <>
      <PageHeader
        num="04"
        eyebrow="Menu"
        title="+40 boissons,"
        titleAccent="à volonté."
        lead="Incluses dans tous nos forfaits. Un vrai barista, des thés premium, des infusions fraîches. Snacks et pâtisseries maison en supplément."
      />

      {/* Stats strip */}
      <section className="section-cream" style={{ padding: "40px 0" }}>
        <div className="wrap grid grid-cols-2 md:grid-cols-4 gap-[14px]">
          {STATS.map((n, i) => (
            <div key={n} className="rounded-[20px] border border-[var(--line)] bg-white text-center p-[22px_12px]">
              <div className="font-serif leading-none text-[var(--main)]" style={{ fontSize: "clamp(30px,3.5vw,44px)" }}>
                {n}
              </div>
              <div className="eyebrow mt-[10px]">{STAT_LABELS[i]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {CAT.map((c, idx) => (
        <section
          key={c.n}
          className="section"
          style={{
            background: c.dark ? "var(--body)" : idx === 0 ? "var(--cream)" : "#fff",
          }}
        >
          <div className="wrap">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-7">
              <div>
                <div
                  className="eyebrow mb-3"
                  style={{ color: c.dark ? "var(--btn)" : "var(--main)" }}
                >
                  — {c.n} · {c.tag}
                </div>
                <h2 className="h2" style={{ color: c.dark ? "#fff" : "var(--body)" }}>
                  {c.title}
                </h2>
              </div>
              {c.included ? (
                <span
                  className="inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-full text-[11px] font-mono tracking-[0.1em]"
                  style={{
                    background: c.dark ? "rgba(242,211,129,0.18)" : "rgba(65,121,114,0.1)",
                    color: c.dark ? "var(--btn)" : "var(--main)",
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
              {c.items.map(([name, desc]) => (
                <div
                  key={name}
                  className="p-[18px] rounded-[16px]"
                  style={{
                    background: c.dark ? "rgba(255,255,255,0.04)" : "#fff",
                    border: c.dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--line)",
                  }}
                >
                  <div className="font-serif text-[18px]" style={{ color: c.dark ? "#fff" : "var(--body)" }}>
                    {name}
                  </div>
                  <div
                    className="text-[12.5px] mt-[6px] leading-[1.5]"
                    style={{ color: c.dark ? "rgba(255,255,255,0.65)" : "var(--gry)" }}
                  >
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
