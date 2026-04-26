import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { MenuCategory } from "@/components/menu";

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
        <MenuCategory
          key={c.n}
          {...c}
          background={c.dark ? "var(--body)" : idx === 0 ? "var(--cream)" : "#fff"}
        />
      ))}
    </>
  );
}
