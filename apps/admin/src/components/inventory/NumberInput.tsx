"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface NumberInputProps {
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  step?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * NumberInput component with same behavior as useNumberInput hook.
 * Supports comma and dot as decimal separator, Safari auto-selection fix,
 * and displays empty field when value is 0/undefined.
 */
export function NumberInput({
  value,
  onChange,
  min = 0,
  step = "0.01",
  placeholder = "0",
  className = "",
  disabled = false,
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  // Display value: local value if focused, field value otherwise
  // Safari fix: convert 0 to empty string to avoid displaying "0" in empty fields
  const displayValue = isFocused
    ? localValue
    : value === 0 || value === undefined || value === null
      ? ""
      : value.toString();

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={displayValue}
      disabled={disabled}
      onChange={(e) => {
        // Keep the value as-is, don't normalize yet
        // This allows Safari to display commas and dots properly
        setLocalValue(e.target.value);
      }}
      onFocus={(e) => {
        setIsFocused(true);
        setLocalValue(value?.toString() || "");
        // Safari fix: setTimeout to prevent auto-deselect
        setTimeout(() => e.target.select(), 0);
      }}
      onMouseUp={(e) => {
        // Prevent Safari from deselecting on mouse up
        e.preventDefault();
      }}
      onBlur={() => {
        setIsFocused(false);
        // Normalize: replace ALL commas with dots (French decimal separator)
        const normalizedValue = localValue.replace(/,/g, ".");
        // Convert to number on blur
        const numValue =
          normalizedValue === "" || normalizedValue === undefined || normalizedValue === "."
            ? 0
            : parseFloat(normalizedValue);
        const finalValue = isNaN(numValue) ? 0 : Math.max(min, numValue);
        onChange(finalValue);
        setLocalValue("");
      }}
      className={className}
    />
  );
}
