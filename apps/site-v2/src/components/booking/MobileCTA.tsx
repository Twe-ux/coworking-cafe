"use client"

import { Icon } from "@/components/ui/Icon"

export interface MobileCTAProps {
  step: number
  total: number
  canProceed: boolean
  onNext: () => void
  onConfirm: () => void
}

const CARD_STYLE: React.CSSProperties = {
  bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)",
  left: 14,
  right: 14,
  background: "#fff",
  borderRadius: 18,
  border: "1px solid var(--line)",
  padding: 14,
  boxShadow: "0 8px 24px rgba(20,34,32,0.08)",
}

const BTN_BASE: React.CSSProperties = {
  border: "none",
  borderRadius: 14,
  padding: "14px 22px",
  fontSize: 14,
}

export function MobileCTA({ step, total, canProceed, onNext, onConfirm }: MobileCTAProps) {
  const isConfirm = step === 4

  return (
    <div className="fixed z-30 flex items-center gap-3" style={CARD_STYLE}>
      {/* Total */}
      <div className="flex-1">
        <div className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--gry)", marginBottom: 2 }}>
          Total estimé
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-serif" style={{ fontSize: 22, color: "var(--body)" }}>
            {total > 0 ? total.toFixed(2) : "—"}
          </span>
          {total > 0 && <>
            <span className="font-sans" style={{ fontSize: 13, color: "var(--gry)" }}>€</span>
            <span className="font-sans" style={{ fontSize: 10, color: "var(--gry)", marginLeft: 4 }}>TTC</span>
          </>}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={isConfirm ? onConfirm : onNext}
        disabled={!canProceed}
        className="font-sans font-semibold flex items-center gap-2 transition-opacity disabled:opacity-40"
        style={{ ...BTN_BASE, background: "var(--body)", color: "#fff", cursor: canProceed ? "pointer" : "not-allowed" }}
      >
        {isConfirm
          ? <><Icon name="check" size={16} stroke="#fff" sw={2.2} /> Payer</>
          : <>Continuer <Icon name="chevRight" size={15} stroke="#fff" sw={2} /></>
        }
      </button>
    </div>
  )
}
