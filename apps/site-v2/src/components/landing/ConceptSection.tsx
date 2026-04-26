import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";

interface Feature {
  icon: IconName;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: "cookie",
    title: "Payez au temps, pas à la conso",
    desc: "Entrez, travaillez, servez-vous. On compte les heures, pas les cafés.",
  },
  {
    icon: "building",
    title: "4 espaces, un seul lieu",
    desc: "Open-space, salles, événementiel. Adaptez l'espace à votre besoin.",
  },
  {
    icon: "sparkle",
    title: "Fibre + équipement pro",
    desc: "Écrans, visio, imprimantes, casiers. Le setup d'un vrai bureau.",
  },
  {
    icon: "people",
    title: "Une communauté",
    desc: "Indépendants, startups, étudiants. Des événements chaque mois.",
  },
];

export function ConceptSection() {
  return (
    <section className="section-main">
      <div className="wrap">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-[clamp(24px,4vw,60px)]">
          {/* Left — heading */}
          <div>
            <div className="eyebrow mb-3" style={{ color: "var(--btn)" }}>
              — 02 · Le concept
            </div>
            <h2 className="h2 text-white">
              Le café{" "}
              <em className="not-italic text-[var(--btn)]">motive</em>.<br />
              L&apos;humain{" "}
              <em className="not-italic text-[var(--btn)]">relie</em>.
            </h2>
          </div>

          {/* Right — features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[clamp(18px,2.5vw,28px)]">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-[14px]">
                <div
                  className="w-11 h-11 shrink-0 rounded-[12px] flex items-center justify-center"
                  style={{ background: "rgba(242,211,129,0.18)" }}
                >
                  <Icon name={f.icon} size={20} stroke="var(--btn)" />
                </div>
                <div>
                  <div className="font-serif text-[17px] text-white">
                    {f.title}
                  </div>
                  <div className="text-[13px] text-white/80 mt-1 leading-[1.5]">
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
