"use client";
import { Icon } from "@/components/ui/Icon";
import { useState } from "react";

interface Member {
  id: string;
  name: string;
  initials: string;
  company: string;
  sector: string;
  joinLabel: string;
}

const SECTORS = ["Tous", "Design", "Tech", "Conseil", "Créatif", "Autre"] as const;
type Sector = (typeof SECTORS)[number];

const MOCK_MEMBERS: Member[] = [
  { id: "m1", name: "Alice Dupont",   initials: "AD", company: "Studio Créatif",   sector: "Design",  joinLabel: "Depuis 8 mois" },
  { id: "m2", name: "Marc Lenoir",    initials: "ML", company: "Tech Solutions",   sector: "Tech",    joinLabel: "Depuis 2 mois" },
  { id: "m3", name: "Sophie Bernard", initials: "SB", company: "Conseil RH",       sector: "Conseil", joinLabel: "Depuis 1 an" },
  { id: "m4", name: "Julien Martin",  initials: "JM", company: "Freelance Dev",    sector: "Tech",    joinLabel: "Depuis 5 mois" },
  { id: "m5", name: "Clara Petit",    initials: "CP", company: "Agence Com",       sector: "Créatif", joinLabel: "Depuis 3 mois" },
  { id: "m6", name: "Thomas Roy",     initials: "TR", company: "Consultant Indep", sector: "Conseil", joinLabel: "Depuis 6 mois" },
];

export function DirectoryScreen() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState<Sector>("Tous");

  const q = search.toLowerCase();
  const filtered = MOCK_MEMBERS.filter((m) =>
    (sector === "Tous" || m.sector === sector) &&
    (q === "" || m.name.toLowerCase().includes(q) || m.company.toLowerCase().includes(q))
  );

  return (
    <div style={{ background: "var(--cream)", minHeight: "100dvh", display: "flex", flexDirection: "column", maxWidth: 640, margin: "0 auto" }}>
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
        <h1 className="font-serif" style={{ fontSize: 26, color: "var(--body)", margin: "8px 0 12px" }}>
          Annuaire
        </h1>

        {/* Search bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fff",
            borderRadius: 14,
            border: "1px solid var(--line)",
            padding: "12px 16px",
            marginBottom: 12,
          }}
        >
          <Icon name="search" size={16} stroke="var(--gry)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un membre..."
            className="font-sans"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 14,
              color: "var(--body)",
            }}
          />
        </div>

        {/* Filter chips */}
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            scrollbarWidth: "none",
            paddingBottom: 4,
          }}
        >
          {SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className="font-mono"
              style={{
                flexShrink: 0,
                padding: "7px 14px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                background: sector === s ? "var(--main)" : "rgba(65,121,114,0.08)",
                color: sector === s ? "#fff" : "var(--body)",
                transition: "all 0.15s",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 24, flex: 1 }}>
        {filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 64, gap: 12 }}>
            <Icon name="search" size={40} stroke="var(--gry)" sw={1.2} />
            <p className="font-sans" style={{ fontSize: 15, fontWeight: 500, color: "var(--body)", margin: 0 }}>Aucun membre trouvé</p>
            <p className="font-sans" style={{ fontSize: 13, color: "var(--gry)", margin: 0 }}>Essayez une autre recherche</p>
          </div>
        ) : (
          <MemberList members={filtered} />
        )}
      </div>
    </div>
  );
}

function MemberList({ members }: { members: Member[] }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--line)", overflow: "hidden" }}>
      {members.map((member, i) => (
        <div key={member.id}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              cursor: "pointer",
            }}
          >
            {/* Avatar */}
            <div
              className="font-serif"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--main)",
                color: "#fff",
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {member.initials}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="font-sans" style={{ fontSize: 15, fontWeight: 500, color: "var(--body)" }}>
                {member.name}
              </div>
              <div className="font-mono" style={{ fontSize: 11, color: "var(--gry)", marginTop: 2 }}>
                {member.company} · {member.joinLabel}
              </div>
            </div>

            {/* Chevron */}
            <Icon name="chevRight" size={16} stroke="rgba(26,26,26,0.25)" />
          </div>

          {/* Divider */}
          {i < members.length - 1 && (
            <div style={{ height: 1, background: "var(--line)", marginLeft: 72 }} />
          )}
        </div>
      ))}
    </div>
  );
}

