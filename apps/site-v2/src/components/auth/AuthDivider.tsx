interface AuthDividerProps {
  text?: string
}

export function AuthDivider({ text = "OU" }: AuthDividerProps) {
  return (
    <div
      className="flex items-center gap-3 my-1.5 font-mono"
      style={{ color: "var(--gry)", fontSize: 11, letterSpacing: "0.10em" }}
    >
      <span
        className="flex-1"
        style={{ height: 1, background: "var(--line)" }}
      />
      <span className="uppercase">{text}</span>
      <span
        className="flex-1"
        style={{ height: 1, background: "var(--line)" }}
      />
    </div>
  )
}
