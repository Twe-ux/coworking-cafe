import { useState, useEffect } from "react"
import type { SpaceConfiguration } from "@/types/booking"
import type { SpaceFormData, UseSpaceFormReturn } from "./types"
import { generateSlug, parseFeatures, getDefaultFormData } from "./utils"

interface UseSpaceFormOptions {
  space?: SpaceConfiguration | null
  open: boolean
  onSuccess: () => void
  onOpenChange: (open: boolean) => void
}

/**
 * Custom hook to manage space form state and logic
 *
 * @param options - Hook options with space, open state and callbacks
 * @returns Form data, handlers and loading state
 */
export function useSpaceForm({
  space,
  open,
  onSuccess,
  onOpenChange,
}: UseSpaceFormOptions): UseSpaceFormReturn {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<SpaceFormData>(getDefaultFormData())
  const [featuresInput, setFeaturesInput] = useState("")

  useEffect(() => {
    if (space) {
      setFormData({
        name: space.name,
        spaceType: space.spaceType,
        slug: space.slug,
        description: space.description || "",
        minCapacity: space.minCapacity,
        maxCapacity: space.maxCapacity,
        pricing: space.pricing,
        availableReservationTypes: space.availableReservationTypes,
        requiresQuote: space.requiresQuote,
        isActive: space.isActive,
        displayOrder: space.displayOrder,
        features: space.features || [],
      })
      setFeaturesInput((space.features || []).join(", "))
    } else {
      setFormData(getDefaultFormData())
      setFeaturesInput("")
    }
  }, [space, open])

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const features = parseFeatures(featuresInput)

      const payload = {
        ...formData,
        features,
      }

      const url = space
        ? `/api/booking/spaces/${space._id}`
        : "/api/booking/spaces"
      const method = space ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        alert(data.error || "Erreur lors de l'enregistrement")
      }
    } catch (error) {
      alert("Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  return {
    formData,
    setFormData,
    featuresInput,
    setFeaturesInput,
    loading,
    handleNameChange,
    handleSubmit,
  }
}
