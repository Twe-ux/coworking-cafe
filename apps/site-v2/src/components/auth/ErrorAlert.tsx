"use client"

interface ErrorAlertProps {
  message: string | null | undefined
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null

  return (
    <div
      className="text-sm px-4 py-3 rounded-[12px]"
      style={{
        background: "rgba(192,83,76,0.08)",
        color: "var(--danger)",
        border: "1px solid rgba(192,83,76,0.2)",
      }}
    >
      {message}
    </div>
  )
}
