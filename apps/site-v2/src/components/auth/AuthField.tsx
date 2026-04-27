"use client"

import { forwardRef, useState } from "react"
import { cn } from "@/lib/cn"
import { Icon } from "@/components/ui/Icon"
import type { IconName } from "@/components/ui/Icon"

interface AuthFieldProps {
  /** Used for htmlFor on label and id on input */
  fieldId: string
  label: string
  type?: "text" | "email" | "password"
  placeholder?: string
  iconName?: IconName
  rightContent?: React.ReactNode
  error?: string
  autoComplete?: string
  // react-hook-form compatible
  name?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  value?: string
  defaultValue?: string
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField(
    {
      fieldId,
      label,
      type = "text",
      placeholder,
      iconName,
      rightContent,
      error,
      autoComplete,
      name,
      onChange,
      onBlur,
      value,
      defaultValue,
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false)

    // Mobile-specific attributes derived from type
    const mobileAttrs =
      type === "email"
        ? ({
            autoCapitalize: "none",
            autoCorrect: "off",
            spellCheck: false,
            inputMode: "email" as const,
          } as const)
        : type === "text"
          ? ({ autoCapitalize: "sentences", autoCorrect: "on" } as const)
          : undefined

    function handleFocus() {
      setIsFocused(true)
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      setIsFocused(false)
      onBlur?.(e)
    }

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label
            htmlFor={fieldId}
            className="font-mono"
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--gry)",
            }}
          >
            {label}
          </label>
          {rightContent}
        </div>

        <div
          className={cn(
            "flex items-center gap-2.5 bg-white transition-all",
            "border rounded-[12px] px-4 py-3.5",
            isFocused
              ? "border-[var(--main)] shadow-[0_0_0_3px_rgba(65,121,114,0.1)]"
              : "border-dark-bg/8"
          )}
        >
          {iconName && (
            <Icon name={iconName} size={16} stroke="var(--main)" />
          )}
          <input
            ref={ref}
            id={fieldId}
            name={name ?? fieldId}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            {...(value !== undefined ? { value } : {})}
            {...(defaultValue !== undefined ? { defaultValue } : {})}
            {...mobileAttrs}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="flex-1 bg-transparent outline-none text-sm font-sans"
            style={{ color: "var(--body)" }}
          />
        </div>

        {error && (
          <p className="text-xs" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}
      </div>
    )
  }
)
