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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      callbackUrl: "/dashboard",
      redirect: true,
    })
    setIsLoading(false)
  }

  return {
    register,
    handleSubmit,
    errors,
    isLoading,
    rememberMe,
    setRememberMe,
    errorMessage,
    onSubmit,
  }
}
