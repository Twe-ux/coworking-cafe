import { Icon } from "@/components/ui/Icon";

interface PromoCard {
  id: number;
  title: string;
  body: string;
  color: string;
  iconName: "gift" | "ticket";
  textColor: string;
}

const PROMOS: PromoCard[] = [
  {
    id: 1,
    title: "Happy Hour",
    body: "-20% sur les open-space après 17h",
    color: "#F2D381",
    iconName: "gift",
    textColor: "var(--body)",
  },
  {
    id: 2,
    title: "Privatisation weekend",
    body: "Tarif dégressif dès 4h",
    color: "#5A938B",
    iconName: "ticket",
    textColor: "#fff",
  },
];

export function PromoCarousel() {
  return (
    <div style={{ padding: "22px 0 0" }}>
      {/* Section eyebrow */}
      <div
        className="font-mono"
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--gry)",
          marginBottom: 12,
          paddingLeft: 20,
        }}
      >
        Pour vous
      </div>

      {/* Horizontal scroll */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "0 20px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {PROMOS.map((promo) => (
          <div
            key={promo.id}
            style={{
              flexShrink: 0,
              width: 220,
              background: promo.color,
              color: promo.textColor,
              borderRadius: 18,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <Icon name={promo.iconName} size={20} stroke={promo.textColor} />
            <div
              className="font-serif"
              style={{ fontSize: 18, lineHeight: 1.2 }}
            >
              {promo.title}
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              {promo.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
