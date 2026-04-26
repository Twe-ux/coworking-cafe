"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { PLANS } from "@/types/pricing";

export function PricingPlans() {
  const [mode, setMode] = useState<"mensuel" | "annuel">("mensuel");
  const isAnnuel = mode === "annuel";

  return (
    <section className="section section-cream" style={{ paddingBottom: 0 }}>
      <div className="wrap flex flex-col items-center gap-[clamp(32px,4vw,48px)]">
        {/* Toggle */}
        <div className="bg-white border border-[var(--line)] rounded-full p-1 flex gap-[2px]">
          {(["mensuel", "annuel"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-[22px] py-[10px] rounded-full text-[13px] font-medium capitalize transition-all"
              style={{
                background: mode === m ? "var(--body)" : "transparent",
                color: mode === m ? "#fff" : "var(--body)",
              }}
            >
              {m}
              {m === "annuel" && (
                <span
                  className="ml-2 text-[11px]"
                  style={{ color: mode === m ? "var(--btn)" : "var(--main)" }}
                >
                  -15%
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] w-full">
          {PLANS.map((p) => {
            const finalPrice =
              p.key === "monthly" && isAnnuel
                ? Math.round(p.price * 0.85)
                : p.price;
            return (
              <div
                key={p.key}
                className="relative rounded-[20px] border p-[clamp(22px,3vw,36px)] flex flex-col"
                style={{
                  background: p.popular ? "var(--body)" : "#fff",
                  color: p.popular ? "#fff" : "var(--body)",
                  borderColor: p.popular ? "var(--body)" : "var(--line)",
                }}
              >
                {p.popular && (
                  <span className="absolute -top-[14px] left-1/2 -translate-x-1/2 inline-flex items-center gap-[6px] px-[14px] py-[6px] rounded-full bg-[var(--btn)] text-[11px] font-mono tracking-[0.1em] text-[#1A1A1A] whitespace-nowrap">
                    <Icon name="sparkle" size={12} stroke="#1A1A1A" fill="#1A1A1A" />
                    Le plus choisi
                  </span>
                )}
                <div
                  className="text-[11px] font-mono tracking-[0.14em] uppercase"
                  style={{ color: p.popular ? "var(--btn)" : "var(--main)" }}
                >
                  {p.label}
                </div>
                <div className="flex items-baseline gap-[4px] mt-3">
                  <span
                    className="font-serif leading-none"
                    style={{
                      fontSize: "clamp(42px,5vw,60px)",
                      color: p.popular ? "var(--btn)" : "var(--body)",
                    }}
                  >
                    {finalPrice}€
                  </span>
                  <span className="text-[14px] opacity-70">{p.unit}</span>
                </div>
                <p className="text-[14px] opacity-75 mt-[10px] leading-[1.5]">
                  {p.desc}
                </p>
                <ul className="flex flex-col gap-[10px] my-[22px] flex-1 list-none p-0 m-0">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-[10px] text-[13.5px]">
                      <Icon
                        name="check"
                        size={13}
                        stroke={p.popular ? "var(--btn)" : "var(--main)"}
                        sw={2.5}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/booking" className="no-underline">
                  <Button
                    variant={p.popular ? "primary" : "dark"}
                    size="md"
                    className="w-full"
                  >
                    {p.popular ? "Choisir cette formule" : "Sélectionner"}
                    <Icon
                      name="chevRight"
                      size={14}
                      stroke={p.popular ? "#1A1A1A" : "#fff"}
                      sw={2.2}
                    />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
