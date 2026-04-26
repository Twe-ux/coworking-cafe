"use client"

import Link from "next/link"
import { AuthLogo, AuthBrandPanel, AuthField, AuthDivider, SocialButton } from "@/components/auth"
import { Icon } from "@/components/ui/Icon"
import { useLoginForm } from "./useLoginForm"

export function LoginForm() {
  const {
    register,
    handleSubmit,
    errors,
    isLoading,
    rememberMe,
    setRememberMe,
    errorMessage,
    onSubmit,
  } = useLoginForm()

  const forgotLink = (
    <Link
      href="/reset"
      className="font-mono"
      style={{ fontSize: 11, color: "var(--main)", textDecoration: "none", letterSpacing: "0.04em" }}
    >
      Mot de passe oublié ?
    </Link>
  )

  const errorBanner = errorMessage ? (
    <div
      className="text-sm px-4 py-3 rounded-[12px]"
      style={{ background: "rgba(192,83,76,0.08)", color: "var(--danger)", border: "1px solid rgba(192,83,76,0.2)" }}
    >
      {errorMessage}
    </div>
  ) : null

  const fields = (
    <div className="flex flex-col gap-3.5">
      <AuthField fieldId="email" label="Email" type="email" placeholder="claire@exemple.fr"
        iconName="mail" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <AuthField fieldId="password" label="Mot de passe" type="password" placeholder="••••••••"
        iconName="lock" rightContent={forgotLink} autoComplete="current-password"
        error={errors.password?.message} {...register("password")} />
    </div>
  )

  const rememberCheckbox = (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <button type="button" role="checkbox" aria-checked={rememberMe}
        onClick={() => setRememberMe(!rememberMe)}
        className="flex items-center justify-center transition-colors"
        style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0,
          background: rememberMe ? "var(--main)" : "#fff",
          border: rememberMe ? "none" : "1px solid var(--line)" }}
      >
        {rememberMe && <Icon name="check" size={12} stroke="#fff" sw={2.8} />}
      </button>
      <span className="text-sm font-sans" style={{ color: "var(--body)" }}>
        Rester connecté sur cet appareil
      </span>
    </label>
  )

  const submitBtn = (
    <button type="submit" disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full font-sans font-medium transition-opacity disabled:opacity-60"
      style={{ background: "var(--body)", color: "var(--btn)", borderRadius: 12,
        padding: "14px 20px", fontSize: 14, border: "none",
        cursor: isLoading ? "not-allowed" : "pointer", marginTop: 10 }}
    >
      {isLoading ? "Connexion…" : "Se connecter"}
      {!isLoading && <Icon name="chevRight" size={14} stroke="var(--btn)" sw={2.2} />}
    </button>
  )

  const formBody = (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {errorBanner}
      {fields}
      {rememberCheckbox}
      {submitBtn}
    </form>
  )

  const registerLink = (
    <div className="text-center text-sm" style={{ color: "var(--gry)" }}>
      Pas encore de compte ?{" "}
      <Link href="/register" className="font-medium" style={{ color: "var(--main)" }}>
        Créer un compte
      </Link>
    </div>
  )

  return (
    <div className="flex items-center justify-center min-h-screen p-6 md:p-8">
      <div className="w-full max-w-[1240px]">

        {/* Mobile */}
        <div className="md:hidden flex flex-col gap-8 max-w-[400px] mx-auto" style={{ paddingTop: 8 }}>
          <AuthLogo />
          <div>
            <div className="font-mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--main)", marginBottom: 8 }}>
              — Content de vous revoir —
            </div>
            <h1 className="font-serif" style={{ fontSize: 34, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", color: "var(--body)", margin: 0 }}>
              Entrez dans votre <em style={{ color: "var(--main)", fontStyle: "italic" }}>espace</em>
            </h1>
          </div>
          <div className="flex flex-col gap-2.5">
            <SocialButton brand="apple" />
            <SocialButton brand="google" />
          </div>
          <AuthDivider text="OU PAR EMAIL" />
          {formBody}
          {registerLink}
        </div>

        {/* Desktop */}
        <div className="hidden md:grid overflow-hidden"
          style={{ gridTemplateColumns: "1fr 1fr", borderRadius: 18, background: "#fff",
            boxShadow: "0 30px 60px rgba(20,34,32,0.14), 0 0 0 1px var(--line)" }}
        >
          <AuthBrandPanel mode="login" />
          <div className="flex flex-col overflow-y-auto bg-white" style={{ padding: "44px 60px" }}>
            <div className="flex justify-between items-center">
              <div className="font-mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gry)" }}>
                Français · FR
              </div>
              <div className="text-sm" style={{ color: "var(--gry)" }}>
                Pas de compte ?{" "}
                <Link href="/register" className="font-medium" style={{ color: "var(--main)", borderBottom: "1px solid var(--main)", paddingBottom: 2 }}>
                  Créer un compte
                </Link>
              </div>
            </div>

            <div className="flex flex-col my-auto max-w-[440px] w-full" style={{ paddingTop: 40, paddingBottom: 40 }}>
              <div className="font-mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--main)", marginBottom: 8 }}>
                — Content de vous revoir —
              </div>
              <h1 className="font-serif" style={{ fontSize: 44, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.025em", color: "var(--body)", margin: 0 }}>
                Connectez-vous à votre <em style={{ color: "var(--main)", fontStyle: "italic" }}>espace</em>
              </h1>
              <p className="font-sans" style={{ fontSize: 14, color: "var(--gry)", marginTop: 14, lineHeight: 1.55 }}>
                Accédez à vos réservations, votre fidélité et vos factures en un clin d&apos;œil.
              </p>
              <div className="grid gap-2.5" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 28 }}>
                <SocialButton brand="apple" />
                <SocialButton brand="google" />
              </div>
              <AuthDivider text="OU PAR EMAIL" />
              {formBody}
            </div>

            <div className="flex items-center justify-center gap-1.5 font-mono"
              style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--gry)", textTransform: "uppercase" }}
            >
              <Icon name="shield" size={10} stroke="var(--gry)" />
              PAIEMENT & DONNÉES SÉCURISÉS · RGPD
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
