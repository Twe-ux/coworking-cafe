import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function CtaSection() {
  return (
    <section className="section-dark" style={{ padding: "clamp(40px, 6vw, 64px) 0" }}>
      <div className="wrap flex flex-wrap justify-between items-center gap-6">
        <div>
          <div
            className="eyebrow mb-3"
            style={{ color: "var(--btn)" }}
          >
            — Prêt à commencer ?
          </div>
          <h2 className="h2 text-white">
            Votre première{" "}
            <em className="not-italic text-[var(--btn)]">heure offerte</em>.
          </h2>
        </div>

        <div className="flex flex-wrap gap-[12px]">
          <Link href="/register">
            <Button variant="ghost-light" size="md">
              Créer un compte
            </Button>
          </Link>
          <Link href="/booking">
            <Button variant="primary" size="md">
              Réserver
              <Icon name="chevRight" size={14} stroke="var(--body)" sw={2.2} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
