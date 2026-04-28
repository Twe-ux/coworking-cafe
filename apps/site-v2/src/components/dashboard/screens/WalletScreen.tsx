"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { MOCK_STATS } from "@/types/dashboard";

interface RechargeOption {
  credits: number;
  price: string;
  label: string;
}

interface RechargeHistory {
  date: string;
  amount: string;
  price: string;
  method: string;
}

const RECHARGE_OPTIONS: RechargeOption[] = [
  { credits: 100, price: "10€", label: "100 crédits — 10€" },
  { credits: 250, price: "22€", label: "250 crédits — 22€" },
  { credits: 500, price: "40€", label: "500 crédits — 40€" },
];

const RECHARGE_HISTORY: RechargeHistory[] = [
  { date: "14 avril 2026", amount: "250 crédits", price: "22€", method: "Carte •••• 4242" },
  { date: "01 mars 2026",  amount: "100 crédits", price: "10€", method: "Carte •••• 4242" },
  { date: "12 jan. 2026",  amount: "500 crédits", price: "40€", method: "Apple Pay" },
];

export function WalletScreen() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div style={{ background: "var(--cream)", minHeight: "100dvh", display: "flex", flexDirection: "column", maxWidth: 600, margin: "0 auto", width: "100%" }}>
      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, paddingTop: "env(safe-area-inset-top)", paddingLeft: 16, paddingRight: 16, paddingBottom: 14, background: "var(--cream)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <h1 className="font-serif" style={{ fontSize: 26, color: "var(--body)", margin: 0 }}>
            Portefeuille
          </h1>
          <button style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(65,121,114,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="plus" size={17} stroke="var(--body)" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Hero card dark */}
        <div style={{ background: "var(--body)", borderRadius: 22, padding: 22, position: "relative", overflow: "hidden" }}>
          {/* Glow décoratif */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle at center, rgba(242,211,129,0.18), transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative" }}>
            <p className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.14em", margin: 0 }}>
              Votre solde
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
              <span className="font-mono" style={{ fontSize: 42, color: "var(--btn)", lineHeight: 1 }}>
                {MOCK_STATS.memberPoints}
              </span>
              <span className="font-sans" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                crédits
              </span>
            </div>
            <p className="font-mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "8px 0 0" }}>
              Valide jusqu&apos;au 31 décembre 2026
            </p>
          </div>
        </div>

        {/* Section recharge */}
        <div>
          <p className="eyebrow" style={{ marginBottom: 12 }}>Recharger</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {RECHARGE_OPTIONS.map((opt) => (
              <button
                key={opt.credits}
                onClick={() => setSelected(opt.credits)}
                style={{
                  background: selected === opt.credits ? "rgba(65,121,114,0.14)" : "rgba(65,121,114,0.08)",
                  border: `1px solid ${selected === opt.credits ? "var(--main)" : "var(--line)"}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                }}
              >
                <span className="font-mono" style={{ fontSize: 12, color: "var(--main)", fontWeight: 600 }}>
                  {opt.credits}
                </span>
                <span className="font-sans" style={{ fontSize: 13, color: "var(--body)" }}>
                  crédits — {opt.price}
                </span>
              </button>
            ))}
          </div>
          <button
            style={{
              width: "100%",
              background: "var(--btn)",
              color: "var(--body)",
              borderRadius: 14,
              padding: 14,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
            className="font-sans"
          >
            Recharger
          </button>
        </div>

        {/* Historique */}
        <div>
          <p className="eyebrow" style={{ marginBottom: 12 }}>Dernières recharges</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {RECHARGE_HISTORY.map((entry, i) => (
              <div
                key={i}
                style={{
                  background: "var(--white)",
                  borderRadius: 14,
                  border: "1px solid var(--line)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(65,121,114,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="tag" size={16} stroke="var(--main)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-sans" style={{ fontSize: 13, color: "var(--body)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {entry.date}
                  </div>
                  <div className="font-sans" style={{ fontSize: 12, color: "var(--gry)", marginTop: 2 }}>
                    {entry.method}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="font-sans" style={{ fontSize: 13, color: "var(--body)", fontWeight: 600 }}>
                    {entry.price}
                  </div>
                  <div className="font-mono" style={{ fontSize: 11, color: "var(--main)", marginTop: 2 }}>
                    {entry.amount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
