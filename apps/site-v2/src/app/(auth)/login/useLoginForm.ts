"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
})

export type LoginFormValues = z.infer<typeof schema>

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Email ou mot de passe incorrect.",
  network: "Connexion impossible. Vérifiez votre connexion réseau.",
  default: "Une erreur est survenue. Veuillez réessayer.",
}

export type UseLoginFormReturn = ReturnType<typeof useLoginForm>

export function useLoginForm() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")
  const errorMessage = errorParam
    ? (ERROR_MESSAGES[errorParam] ?? ERROR_MESSAGES.default)
    : null

  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setSubmitError(null)
    try {
      const result = await signIn("credentials", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        redirect: false,
      })
      setIsLoading(false)
      if (result === null || result === undefined) {
        setSubmitError(ERROR_MESSAGES.network)
        return
      }
      if (!result.ok) {
        const code = result.error ?? "default"
        setSubmitError(ERROR_MESSAGES[code] ?? ERROR_MESSAGES.default)
        return
      }
      window.location.href = "/dashboard"
    } catch {
      setIsLoading(false)
      setSubmitError(ERROR_MESSAGES.network)
    }
  }

  return {
    register,
    handleSubmit,
    errors,
    isLoading,
    rememberMe,
    setRememberMe,
    errorMessage,
    submitError,
    onSubmit,
  }
}
