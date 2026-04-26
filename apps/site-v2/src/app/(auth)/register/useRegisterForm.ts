"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"

export const step1Schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
})

export const step2Schema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().optional(),
  cgu: z.literal(true, {
    errorMap: () => ({ message: "Veuillez accepter les CGU" }),
  }),
})

export type Step1Values = z.infer<typeof step1Schema>
export type Step2Values = z.infer<typeof step2Schema>

export type UseRegisterFormReturn = ReturnType<typeof useRegisterForm>

export function useRegisterForm() {
  const [step, setStep] = useState<1 | 2>(1)
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [cguChecked, setCguChecked] = useState(false)

  const form1 = useForm<Step1Values>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { cgu: undefined },
  })

  function onStep1(data: Step1Values) {
    setStep1Data(data)
    setSubmitError(null)
    setStep(2)
  }

  function toggleCgu() {
    const next = !cguChecked
    setCguChecked(next)
    // Inform react-hook-form of the real value so z.literal(true) validation passes
    form2.setValue("cgu", next as true, { shouldValidate: true })
  }

  async function onStep2(data: Step2Values) {
    if (!step1Data) return
    setIsLoading(true)
    setSubmitError(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: step1Data.email,
          password: step1Data.password,
          givenName: `${data.firstName}${data.lastName ? " " + data.lastName : ""}`,
        }),
      })

      if (response.ok) {
        await signIn("credentials", {
          email: step1Data.email,
          password: step1Data.password,
          callbackUrl: "/dashboard",
          redirect: true,
        })
        return
      }

      const ResponseSchema = z.object({ error: z.string().optional() })
      const bodyResult = ResponseSchema.safeParse(await response.json())
      const body = bodyResult.success ? bodyResult.data : { error: undefined }
      if (response.status === 409) {
        setSubmitError("Cet email est déjà utilisé.")
        setStep(1)
      } else {
        setSubmitError(body.error ?? "Une erreur est survenue.")
      }
    } catch {
      setSubmitError("Une erreur est survenue.")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    step,
    setStep,
    isLoading,
    submitError,
    cguChecked,
    toggleCgu,
    form1,
    form2,
    onStep1,
    onStep2,
  }
}
