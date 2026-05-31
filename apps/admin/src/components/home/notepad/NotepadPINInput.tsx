"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NotepadPINInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function NotepadPINInput({
  value,
  onChange,
  disabled,
  error,
}: NotepadPINInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    onChange(raw);
  };

  return (
    <div className="space-y-1 flex flex-col items-center gap-4">
      <Label className="text-xs text-muted-foreground">
        Code de pointage (4 chiffres)
      </Label>
      <Input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="\d{4}"
        maxLength={4}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="••••"
        className={`w-28 text-center tracking-widest text-lg h-9 ${error ? "border-red-500" : ""}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
