"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: string // Format YYYY-MM-DD
  onDateChange: (date: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

/**
 * Parse une date string en objet Date de manière robuste
 * Gère les formats YYYY-MM-DD et les anciennes dates invalides
 */
function parseDateSafely(dateString: string): Date | null {
  if (!dateString) return null

  // Try format YYYY-MM-DD (nouveau format correct)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const parsed = parse(dateString, "yyyy-MM-dd", new Date())
    return isValid(parsed) ? parsed : null
  }

  // Try parsing as ISO date
  const isoDate = new Date(dateString)
  if (isValid(isoDate)) {
    return isoDate
  }

  // Si tout échoue, retourner null
  return null
}

/**
 * DatePicker component qui permet d'écrire la date ET d'utiliser le calendrier
 * Retourne toujours une string au format YYYY-MM-DD
 * Conforme aux conventions CLAUDE.md : dates en format string
 */
export function DatePicker({
  date,
  onDateChange,
  placeholder = "JJ/MM/AAAA",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [isEditing, setIsEditing] = React.useState(false)

  // Convertir la string en Date pour le Calendar
  const dateObject = date ? parseDateSafely(date) : undefined

  // Synchroniser l'input avec la date sélectionnée (seulement si pas en train d'éditer)
  React.useEffect(() => {
    if (!isEditing) {
      if (date && dateObject) {
        // Afficher au format français dd/MM/yyyy
        setInputValue(format(dateObject, "dd/MM/yyyy", { locale: fr }))
      } else if (!date) {
        setInputValue("")
      }
    }
  }, [date, dateObject, isEditing])

  // Gérer la sélection depuis le calendrier
  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setIsEditing(false) // Arrêter le mode édition
      // Formater en YYYY-MM-DD (convention CLAUDE.md)
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedDate.getDate()).padStart(2, "0")
      const formattedDate = `${year}-${month}-${day}`
      onDateChange(formattedDate)
      setOpen(false)
    }
  }

  // Gérer le focus (début d'édition)
  const handleFocus = () => {
    setIsEditing(true)
  }

  // Gérer la perte de focus (fin d'édition)
  const handleBlur = () => {
    setIsEditing(false)

    // Vérifier si la valeur saisie est valide
    const value = inputValue.trim()

    if (!value) {
      onDateChange("")
      return
    }

    // Essayer de parser la date saisie
    const patterns = [
      { regex: /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/, format: "dd/MM/yyyy" },
      { regex: /^(\d{4})[\/\-](\d{2})[\/\-](\d{2})$/, format: "yyyy-MM-dd" },
    ]

    let validDate = false
    for (const pattern of patterns) {
      if (pattern.regex.test(value)) {
        const parsed = parse(value, pattern.format, new Date())
        if (isValid(parsed)) {
          const year = parsed.getFullYear()
          const month = String(parsed.getMonth() + 1).padStart(2, "0")
          const day = String(parsed.getDate()).padStart(2, "0")
          const formattedDate = `${year}-${month}-${day}`
          onDateChange(formattedDate)
          validDate = true
          break
        }
      }
    }

    // Si la date n'est pas valide, restaurer la valeur précédente
    if (!validDate && dateObject) {
      setInputValue(format(dateObject, "dd/MM/yyyy", { locale: fr }))
    }
  }

  // Gérer la saisie manuelle avec formatage automatique des slashes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // Supprimer tous les caractères non numériques
    const numbersOnly = input.replace(/\D/g, "")

    // Limiter à 8 chiffres (JJMMAAAA)
    const limited = numbersOnly.slice(0, 8)

    // Formater avec slashes automatiques
    let formatted = ""
    if (limited.length > 0) {
      formatted = limited.slice(0, 2) // JJ
      if (limited.length >= 3) {
        formatted += "/" + limited.slice(2, 4) // MM
      }
      if (limited.length >= 5) {
        formatted += "/" + limited.slice(4, 8) // AAAA
      }
    }

    setInputValue(formatted)
  }

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn("pr-10", className)}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="absolute right-0 top-0 h-full px-3 hover:bg-muted rounded-r-md transition-colors"
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={dateObject || undefined}
            onSelect={handleCalendarSelect}
            initialFocus
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
