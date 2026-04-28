"use client"

import { useState, useMemo } from "react"
import type { BookingState, BookingStep, BookingType, PriceBreakdown } from "@/types/booking"
import type { Venue } from "@/types/venue"
import { SPACES, BOOKING_SERVICES, TYPE_MULTIPLIERS } from "@/types/booking"

const INITIAL_STATE: BookingState = {
  venueId: null,
  spaceId: null,
  bookingType: "hourly",
  date: null,
  startTime: null,
  endTime: null,
  people: 1,
  services: [],
  specialRequest: "",
  step: 1,  // sera overridé à l'init
}

function calculateHours(state: BookingState): number {
  if (state.bookingType === "hourly") {
    if (!state.startTime || !state.endTime) return 0
    const [sh, sm] = state.startTime.split(":").map(Number)
    const [eh, em] = state.endTime.split(":").map(Number)
    return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60)
  }
  if (state.bookingType === "daily") return 10
  if (state.bookingType === "weekly") return 50   // 5j × 10h
  if (state.bookingType === "monthly") return 200  // 20j × 10h
  return 0
}

function calculatePricing(state: BookingState): PriceBreakdown {
  const space = SPACES.find((s) => s.id === state.spaceId)
  if (!space) return { base: 0, servicesTotal: 0, total: 0, discount: 0, hours: 0 }

  const multiplier = TYPE_MULTIPLIERS[state.bookingType]
  const discount = state.bookingType === "weekly" ? 0.15 : state.bookingType === "monthly" ? 0.40 : 0
  const hours = calculateHours(state)
  const base = space.pricePerHour * hours * multiplier

  const servicesTotal = state.services.reduce((acc, id) => {
    const svc = BOOKING_SERVICES.find((s) => s.id === id)
    return acc + (svc?.price ?? 0)
  }, 0)

  return {
    base: Math.round(base * 100) / 100,
    servicesTotal,
    total: Math.round((base + servicesTotal) * 100) / 100,
    discount,
    hours,
  }
}

export function useBooking(venues: Venue[]) {
  const hasMultiVenue = venues.length > 1
  const firstStep: BookingStep = hasMultiVenue ? 0 : 1
  const totalSteps = hasMultiVenue ? 5 : 4

  const [state, setState] = useState<BookingState>({
    ...INITIAL_STATE,
    venueId: !hasMultiVenue ? (venues[0]?.id ?? null) : null,
    step: firstStep,
  })

  const pricing = useMemo(() => calculatePricing(state), [state])

  function setVenue(venueId: string) {
    setState((s) => ({ ...s, venueId }))
  }

  function setSpace(spaceId: string) {
    setState((s) => ({ ...s, spaceId, people: 1 }))
  }

  function setBookingType(bookingType: BookingType) {
    setState((s) => ({ ...s, bookingType, startTime: null, endTime: null }))
  }

  function setDate(date: string) {
    setState((s) => ({ ...s, date, startTime: null, endTime: null }))
  }

  function setStartTime(startTime: string) {
    setState((s) => ({ ...s, startTime, endTime: null }))
  }

  function setEndTime(endTime: string) {
    setState((s) => ({ ...s, endTime }))
  }

  function setPeople(people: number) {
    const space = SPACES.find((sp) => sp.id === state.spaceId)
    const max = space?.maxPeople ?? 50
    setState((s) => ({ ...s, people: Math.max(1, Math.min(people, max)) }))
  }

  function toggleService(serviceId: string) {
    setState((s) => ({
      ...s,
      services: s.services.includes(serviceId)
        ? s.services.filter((id) => id !== serviceId)
        : [...s.services, serviceId],
    }))
  }

  function setSpecialRequest(specialRequest: string) {
    setState((s) => ({ ...s, specialRequest }))
  }

  function canProceed(): boolean {
    switch (state.step) {
      case 0: return state.venueId !== null
      case 1: return state.spaceId !== null
      case 2: {
        if (state.date === null) return false
        if (state.bookingType === "hourly") return state.startTime !== null && state.endTime !== null
        return true
      }
      case 3: return true
      case 4: return true
      default: return false
    }
  }

  function nextStep() {
    if (!canProceed()) return
    setState((s) => ({ ...s, step: Math.min(s.step + 1, 4) as BookingStep }))
  }

  function prevStep() {
    setState((s) => ({ ...s, step: Math.max(s.step - 1, firstStep) as BookingStep }))
  }

  // Navigate to any already-visited step (no jumping ahead)
  function goToStep(target: BookingStep) {
    if (target >= firstStep && target <= state.step) {
      setState((s) => ({ ...s, step: target }))
    }
  }

  return {
    state,
    pricing,
    totalSteps,
    firstStep,
    setVenue,
    setSpace,
    setBookingType,
    setDate,
    setStartTime,
    setEndTime,
    setPeople,
    toggleService,
    setSpecialRequest,
    canProceed,
    nextStep,
    prevStep,
    goToStep,
  }
}
