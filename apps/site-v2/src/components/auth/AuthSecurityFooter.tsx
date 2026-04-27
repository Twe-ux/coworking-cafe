import { Icon } from "@/components/ui/Icon"

export function AuthSecurityFooter() {
  return (
    <div
      className="hidden md:flex items-center justify-center gap-1.5 font-mono mt-auto pt-[40px]"
      style={{
        fontSize: 11,
        letterSpacing: "0.08em",
        color: "var(--gry)",
        textTransform: "uppercase",
      }}
    >
      <Icon name="shield" size={10} stroke="var(--gry)" />
      PAIEMENT &amp; DONNÉES SÉCURISÉS · RGPD
    </div>
  )
}
