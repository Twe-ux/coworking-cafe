import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { ROOMS } from "@/types/pricing";

export function RoomsTable() {
  return (
    <section className="section section-cream" style={{ paddingTop: "clamp(20px,2vw,28px)" }}>
      <div className="wrap">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-[22px]">
          <div>
            <div className="eyebrow mb-3">— Salles privatisables</div>
            <h2 className="h2">
              À l&apos;heure,{" "}
              <em className="accent">à la demande.</em>
            </h2>
          </div>
        </div>

        <div className="rounded-[20px] border border-[var(--line)] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] px-6 py-[18px] bg-[rgba(65,121,114,0.06)] border-b border-[var(--line)]">
            {["Salle", "Capacité", "Tarif", ""].map((h, i) => (
              <span
                key={i}
                className="eyebrow"
                style={{ textAlign: i === 3 ? "right" : "left" }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {ROOMS.map((r, i) => (
            <div
              key={r.name}
              className={`grid grid-cols-[1.5fr_1fr_1fr_1fr] px-6 py-5 items-center ${
                i < ROOMS.length - 1 ? "border-b border-[var(--line)]" : ""
              }`}
            >
              <div className="flex items-center gap-[14px]">
                <div
                  className="w-[10px] h-[40px] rounded-[3px] shrink-0"
                  style={{ background: r.color }}
                />
                <span className="font-serif text-[19px]">{r.name}</span>
              </div>
              <div className="text-[14px]">{r.cap}</div>
              <div className="font-serif text-[20px] text-[var(--main)]">
                {r.price}€
                <span className="text-[13px] text-[var(--gry)] font-normal">/h</span>
              </div>
              <div className="flex justify-end">
                <Link href="/booking">
                  <Button variant="ghost" size="sm">
                    Réserver
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="flex items-center justify-center gap-[6px] text-[12.5px] text-[var(--gry)] mt-4">
          <Icon name="shield" size={12} stroke="var(--gry)" />
          Prix TTC · Annulation gratuite jusqu&apos;à J-1 · Tarifs dégressifs à la journée
        </p>
      </div>
    </section>
  );
}
