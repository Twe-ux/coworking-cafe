"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { MOCK_PAST, SPACE_COLORS } from "@/types/dashboard";
import type { DashboardBooking } from "@/types/dashboard";

type HistoryTab = "all" | "month" | "quarter";

const TABS: { key: HistoryTab; label: string }[] = [
  { key: "all",     label: "Toutes"       },
  { key: "month",   label: "Ce mois"      },
  { key: "quarter", label: "Ce trimestre" },
];

function TransactionRow({ booking }: { booking: DashboardBooking }) {
  const sp = SPACE_COLORS[booking.spaceKey];

  return (
    <div
      style={{
        background: "var(--white)",
        borderRadius: 16,
        border: "1px solid var(--line)",
        padding: "14px 16px",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      {/* Date badge */}
      <div
        style={{
          width: 46,
          borderRadius: 12,
          alignSelf: "stretch",
          background: sp.bg,
          border: `1px solid ${sp.color}33`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <span className="font-serif" style={{ fontSize: 18, fontWeight: 500, color: sp.color, lineHeight: 1 }}>
          {booking.day}
        </span>
        <span
          className="font-mono"
          style={{ fontSize: 9, textTransform: "uppercase", color: sp.color, opacity: 0.8, letterSpacing: "0.08em" }}
        >
          {booking.month}
        </span>
      </div>

      {/* Center info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-sans" style={{ fontSize: 15, fontWeight: 500, color: "var(--body)" }}>
          {booking.space}
        </div>
        <div className="font-mono" style={{ fontSize: 11, color: "var(--gry)", marginTop: 3 }}>
          {booking.time} · {booking.duration}
        </div>
      </div>

      {/* Right: amount + status chip */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <span className="font-mono" style={{ fontSize: 15, fontWeight: 500, color: "var(--body)" }}>
          {booking.price} €
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: 10,
            padding: "3px 8px",
            borderRadius: 999,
            background: "rgba(76,160,110,0.14)",
            color: "var(--success)",
            lineHeight: 1.6,
          }}
        >
          Complétée
        </span>
      </div>
    </div>
  );
}

export function HistoryScreen() {
  const [tab, setTab] = useState<HistoryTab>("all");
  const now = new Date();
  const transactions = MOCK_PAST.filter((b) => {
    if (tab === "all") return true;
    const d = new Date(b.date);
    if (tab === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    const q = Math.floor(now.getMonth() / 3);
    return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === q;
  });

  return (
    <div style={{ background: "var(--cream)", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          paddingTop: "env(safe-area-inset-top)",
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 14,
          background: "var(--cream)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 16 }}>
          <h1 className="font-serif" style={{ fontSize: 26, color: "var(--body)", margin: 0 }}>
            Historique
          </h1>
          <button
            aria-label="Télécharger l'historique"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(65,121,114,0.08)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="download" size={17} stroke="var(--body)" />
          </button>
        </div>

        {/* Segmented control — 3 tabs */}
        <div style={{ display: "flex", background: "rgba(65,121,114,0.08)", borderRadius: 12, padding: 4 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="font-sans"
              style={{
                flex: 1,
                padding: "8px 4px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                background: tab === t.key ? "var(--white)" : "transparent",
                color: tab === t.key ? "var(--main)" : "var(--gry)",
                boxShadow: tab === t.key ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div
        style={{
          flex: 1,
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 24,
        }}
      >
        {/* Desktop centering */}
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {transactions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {transactions.map((b) => (
                <TransactionRow key={b.id} booking={b} />
              ))}
            </div>
          ) : (
            <p
              className="font-sans"
              style={{ textAlign: "center", color: "var(--gry)", fontSize: 14, paddingTop: 40 }}
            >
              Aucune transaction sur cette période
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
