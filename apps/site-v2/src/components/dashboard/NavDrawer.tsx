"use client";
import type { IconName } from "@/components/ui/Icon";
import { Icon } from "@/components/ui/Icon";
import type { DashboardSection } from "@/types/dashboard";
import { MOCK_USER } from "@/types/dashboard";

interface NavDrawerProps {
  open: boolean;
  section: DashboardSection;
  onClose: () => void;
  onNavigate: (s: DashboardSection) => void;
}

const NAV_ITEMS: { key: DashboardSection; label: string; icon: IconName }[] = [
  { key: "home", label: "Accueil", icon: "home" },
  { key: "reservations", label: "Réservations", icon: "calendar" },
  { key: "history", label: "Historique", icon: "clock" },
  { key: "profile", label: "Profil", icon: "user" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function NavDrawer({ open, section, onClose, onNavigate }: NavDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 40,
          }}
        />
      )}

      {/* Drawer panel — slides in from right */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 280,
          background: "var(--body)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          paddingTop: "env(safe-area-inset-top, 0px)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div>
            <div
              className="font-serif"
              style={{ fontSize: 18, color: "var(--white)", letterSpacing: "-0.01em" }}
            >
              CoworKing Café
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", marginTop: 2 }}
            >
              ESPACE MEMBRE
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Icon name="x" size={16} stroke="rgba(255,255,255,0.7)" />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ padding: "12px", flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = section === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 2,
                  background: active ? "rgba(242,211,129,0.1)" : "transparent",
                  color: active ? "var(--btn)" : "rgba(255,255,255,0.65)",
                  border: active
                    ? "1px solid rgba(242,211,129,0.22)"
                    : "1px solid transparent",
                }}
              >
                <Icon
                  name={item.icon}
                  size={17}
                  stroke={active ? "var(--btn)" : "currentColor"}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "14px 16px",
            paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              className="font-serif"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "var(--main)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "var(--white)",
                flexShrink: 0,
              }}
            >
              {getInitials(MOCK_USER.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{ fontSize: 13, fontWeight: 500, color: "var(--white)", fontFamily: "Inter, sans-serif" }}
              >
                {MOCK_USER.name}
              </div>
              <div
                style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {MOCK_USER.plan}
              </div>
            </div>
            <button
              style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}
            >
              <Icon name="logout" size={17} stroke="rgba(255,255,255,0.4)" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
