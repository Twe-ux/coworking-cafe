import { Icon } from "@/components/ui/Icon";

export function PromoCarousel() {
  return (
    <div style={{ marginTop: 12, paddingBottom: 4 }}>
      <div style={{ padding: "0 16px", overflowX: "auto", scrollbarWidth: "none" as const }}>
        <div style={{ display: "flex", gap: 10, width: "fit-content", paddingBottom: 4 }}>
          {/* Happy Hour */}
          <div style={{ flexShrink: 0, width: 200, borderRadius: 18, padding: 16, background: "var(--btn)" }}>
            <Icon name="tag" size={20} stroke="var(--body)" />
            <div className="font-serif" style={{ fontSize: 18, color: "var(--body)", marginTop: 10, lineHeight: 1.1 }}>
              Happy Hour
            </div>
            <div className="font-sans" style={{ fontSize: 12, color: "rgba(0,0,0,0.6)", marginTop: 6, lineHeight: 1.4 }}>
              -20% sur les open-space après 17h
            </div>
          </div>

          {/* Privatisation weekend */}
          <div style={{ flexShrink: 0, width: 200, borderRadius: 18, padding: 16, background: "var(--main)" }}>
            <Icon name="tag" size={20} stroke="var(--white)" />
            <div className="font-serif" style={{ fontSize: 18, color: "var(--white)", marginTop: 10, lineHeight: 1.1 }}>
              Privatisation weekend
            </div>
            <div className="font-sans" style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 6, lineHeight: 1.4 }}>
              Tarif dégressif dès 4h
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
