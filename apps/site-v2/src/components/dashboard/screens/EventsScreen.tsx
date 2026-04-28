"use client";
import { Icon } from "@/components/ui/Icon";
import { useState } from "react";

interface DashboardEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  space: string;
  registered: number;
  capacity: number;
  price: string;
  organizer: string;
  organizerName: string;
  tag: string;
  enrolled: boolean;
}

const MOCK_EVENTS: DashboardEvent[] = [
  { id: "e1", title: "Atelier Café Spécialité", description: "Découvrez les secrets des meilleurs cafés du monde avec notre barista expert.", date: "Samedi 5 mai", time: "15:00 – 16:30", space: "Espace Verrière", registered: 12, capacity: 20, price: "Gratuit", organizer: "BM", organizerName: "Baptiste M.", tag: "Atelier", enrolled: true },
  { id: "e2", title: "Networking Entrepreneurs", description: "Rencontrez d'autres entrepreneurs et développez votre réseau local.", date: "Jeudi 8 mai", time: "19:00 – 21:00", space: "Open-space", registered: 18, capacity: 30, price: "5€", organizer: "SL", organizerName: "Sophie L.", tag: "Networking", enrolled: false },
  { id: "e3", title: "Formation No-Code", description: "Apprenez à créer votre premier site web sans coder avec Webflow.", date: "Mardi 13 mai", time: "14:00 – 17:00", space: "Salle Étage", registered: 8, capacity: 12, price: "20€", organizer: "AR", organizerName: "Alex R.", tag: "Formation", enrolled: false },
];

type TabKey = "upcoming" | "past" | "mine";

const TABS: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "À venir" },
  { key: "past", label: "Passés" },
  { key: "mine", label: "Mes événements" },
];

function EventCard({ event }: { event: DashboardEvent }) {
  const spots = event.capacity - event.registered;

  return (
    <div style={{ background: "var(--white)", borderRadius: 18, border: "1px solid var(--line)", padding: 18, marginBottom: 12 }}>
      {/* Tag + spots */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="font-mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", background: "rgba(65,121,114,0.08)", color: "var(--main)", padding: "4px 10px", borderRadius: 999 }}>
          {event.tag}
        </span>
        <span className="font-mono" style={{ fontSize: 11, color: "var(--gry)" }}>
          {spots} place{spots > 1 ? "s" : ""} restante{spots > 1 ? "s" : ""}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-serif" style={{ fontSize: 21, color: "var(--body)", lineHeight: 1.1, marginTop: 10, marginBottom: 0 }}>
        {event.title}
      </h3>

      {/* Description */}
      <p className="font-sans" style={{ fontSize: 13, color: "var(--gry)", lineHeight: 1.5, marginTop: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {event.description}
      </p>

      {/* Details row */}
      <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name="calendar" size={14} stroke="var(--gry)" />
          <span className="font-sans" style={{ fontSize: 13, color: "var(--gry)" }}>{event.date}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name="clock" size={14} stroke="var(--gry)" />
          <span className="font-sans" style={{ fontSize: 13, color: "var(--gry)" }}>{event.time}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name="building" size={14} stroke="var(--gry)" />
          <span className="font-sans" style={{ fontSize: 13, color: "var(--gry)" }}>{event.space}</span>
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
        {/* Organizer */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="font-serif" style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--main)", color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {event.organizer}
          </div>
          <span className="font-sans" style={{ fontSize: 13, color: "var(--body)" }}>{event.organizerName}</span>
        </div>

        {/* Price + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="font-mono" style={{ fontSize: 12, background: "rgba(242,211,129,0.15)", color: "var(--btn-dark)", padding: "4px 10px", borderRadius: 999 }}>
            {event.price}
          </span>
          {event.enrolled ? (
            <button className="font-sans" style={{ background: "rgba(76,160,110,0.12)", color: "var(--success)", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 13, cursor: "default" }}>
              Inscrit
            </button>
          ) : (
            <button className="font-sans" style={{ background: "var(--btn)", color: "var(--body)", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              S&apos;inscrire
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EventsScreen() {
  const [tab, setTab] = useState<TabKey>("upcoming");

  const events = tab === "mine" ? MOCK_EVENTS.filter((e) => e.enrolled) : MOCK_EVENTS;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, paddingTop: "env(safe-area-inset-top)", paddingLeft: 16, paddingRight: 16, paddingBottom: 14, background: "var(--cream)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 16 }}>
          <h1 className="font-serif" style={{ fontSize: 26, color: "var(--body)", margin: 0 }}>
            Événements
          </h1>
          <button style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(65,121,114,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="bell" size={17} stroke="var(--body)" />
          </button>
        </div>

        {/* Segmented control */}
        <div style={{ display: "flex", background: "rgba(65,121,114,0.08)", borderRadius: 12, padding: 4 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="font-sans"
              style={{ flex: 1, padding: "8px 4px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: tab === t.key ? "var(--white)" : "transparent", color: tab === t.key ? "var(--main)" : "var(--gry)", boxShadow: tab === t.key ? "0 1px 2px rgba(0,0,0,0.06)" : "none", transition: "all 0.2s" }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 24, flex: 1 }}>
        {events.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 }}>
            <Icon name="calendar" size={40} stroke="var(--gry)" />
            <p className="font-sans" style={{ fontSize: 14, color: "var(--gry)", textAlign: "center", margin: 0 }}>
              Aucun événement dans cette catégorie
            </p>
          </div>
        ) : (
          <div style={{ maxWidth: 760, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 0 }}>
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
