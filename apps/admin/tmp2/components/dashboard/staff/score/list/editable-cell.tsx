"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Edit, X } from "lucide-react";
import { useEffect, useState } from "react";

interface EditableCellProps {
  value: string;
  onSave: (newValue: string) => void;
  type?: "time" | "text" | "date";
  placeholder?: string;
  hasError?: boolean;
}

export function EditableCell({
  value,
  onSave,
  type = "text",
  placeholder,
  hasError = false,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    // Si l'input est vide, sauvegarder "00:00" pour la base de données
    const valueToSave = editValue || "00:00";
    onSave(valueToSave);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const formatDisplayValue = (val: string) => {
    // Si la valeur est "00:00" ou vide, afficher "--:--"
    if (!val || val === "00:00" || val === "0000-01-01T00:00:00.000Z") {
      return "--:--";
    }

    if (type === "time") {
      // Convertir au format HH:MM si nécessaire
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }
    return val;
  };

  const formatInputValue = (val: string) => {
    // Si la valeur est "00:00" ou vide, laisser l'input vide
    if (!val || val === "00:00" || val === "0000-01-01T00:00:00.000Z") {
      return "";
    }

    if (type === "time") {
      // Pour l'input time, on a besoin du format HH:MM
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return date.toTimeString().slice(0, 5);
      }
    }
    return val;
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-center gap-1">
        <Input
          type={type === "time" ? "time" : type}
          value={formatInputValue(editValue)}
          onChange={(e) => {
            if (type === "time") {
              if (e.target.value === "") {
                // Si l'utilisateur efface le champ, garder la valeur vide
                setEditValue("");
              } else {
                // Convertir HH:MM en ISO string pour la cohérence
                const today = new Date();
                const [hours, minutes] = e.target.value.split(":");
                today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                setEditValue(today.toISOString());
              }
            } else {
              setEditValue(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-8 w-20 text-center text-sm"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          className="h-6 w-6 p-0"
        >
          <Check className="h-3 w-3 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`group mx-auto flex w-24 cursor-pointer items-center justify-center gap-1 rounded p-1 transition-colors ${
        hasError ? "bg-red-200 hover:bg-red-300" : "hover:bg-gray-50"
      }`}
      onClick={() => setIsEditing(true)}
    >
      <span className="text-sm">{formatDisplayValue(value)}</span>
      <Edit className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
    </div>
  );
}
