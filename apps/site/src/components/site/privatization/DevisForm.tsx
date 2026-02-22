"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { devisFormSchema, type DevisFormData } from './DevisFormSchema'
import { ContactSection, EventTypeSection } from './DevisFormFields'
import {
  DateTimeSection,
  AttendeesSection,
  MessageSection,
  SubmitButton,
} from './DevisFormActions'

export function DevisForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DevisFormData>({
    resolver: zodResolver(devisFormSchema),
  })

  const eventType = watch('eventType')

  const onSubmit = async (data: DevisFormData) => {
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/privatization/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.push('/privatization/merci')
      } else {
        const error = await res.json()
        alert(`Erreur : ${error.error || 'Une erreur est survenue'}`)
        setIsSubmitting(false)
      }
    } catch {
      alert("Erreur lors de l'envoi. Veuillez reessayer.")
      setIsSubmitting(false)
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="devis-form">
      <ContactSection register={register} errors={errors} />
      <EventTypeSection register={register} errors={errors} eventType={eventType} />
      <DateTimeSection register={register} errors={errors} minDate={todayStr} />
      <AttendeesSection register={register} errors={errors} />
      <MessageSection register={register} />
      <SubmitButton isSubmitting={isSubmitting} />
    </form>
  )
}
