import { Icon } from "@/components/ui/Icon"

interface SubmitButtonProps {
  loading?: boolean
  children: React.ReactNode
  /** Extra margin top — defaults to 0 */
  mt?: number
}

export function SubmitButton({ loading = false, children, mt = 0 }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full font-sans font-medium transition-opacity disabled:opacity-60"
      style={{
        background: "var(--body)",
        color: "var(--btn)",
        borderRadius: 12,
        padding: "14px 20px",
        fontSize: 14,
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        marginTop: mt,
      }}
    >
      {loading ? `${children}…` : children}
      {!loading && <Icon name="chevRight" size={14} stroke="var(--btn)" sw={2.2} />}
    </button>
  )
}
