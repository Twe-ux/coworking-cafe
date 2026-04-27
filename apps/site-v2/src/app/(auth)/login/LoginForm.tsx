"use client";

import Link from "next/link";

import {
  AuthBrandPanel,
  AuthDivider,
  AuthField,
  AuthLogo,
  SocialButton,
  SubmitButton,
} from "@/components/auth";
import { Icon } from "@/components/ui/Icon";
import { useLoginForm } from "./useLoginForm";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    errors,
    isLoading,
    rememberMe,
    setRememberMe,
    errorMessage,
    submitError,
    onSubmit,
  } = useLoginForm();

  const forgotLink = (
    <Link
      href="/reset"
      className="font-mono"
      style={{
        fontSize: 11,
        color: "var(--main)",
        textDecoration: "none",
        letterSpacing: "0.04em",
      }}
    >
      Mot de passe oublié ?
    </Link>
  );

  const displayError = submitError ?? errorMessage;
  const errorBanner = displayError ? (
    <div
      className="text-sm px-4 py-3 rounded-[12px]"
      style={{
        background: "rgba(192,83,76,0.08)",
        color: "var(--danger)",
        border: "1px solid rgba(192,83,76,0.2)",
      }}
    >
      {displayError}
    </div>
  ) : null;

  return (
    <div className="flex items-center justify-center min-h-full p-6 pt-0 md:p-8">
      <div className="w-full max-w-[400px] md:max-w-[1240px]">
        {/*
          Single grid: 1 col on mobile (brand hidden), 2 cols on desktop.
          Form inputs rendered ONCE — no double ref registration.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:overflow-hidden md:rounded-[18px] md:bg-white md:shadow-[0_30px_60px_rgba(20,34,32,0.14),0_0_0_1px_var(--line)]">
          {/* Brand panel — desktop left column only */}
          <div className="hidden md:block h-full">
            <AuthBrandPanel mode="login" />
          </div>

          {/* Form column — always rendered once */}
          <div className="flex flex-col md:overflow-y-auto md:bg-white md:px-[60px] md:py-[44px]">
            {/* Mobile logo */}
            <div className="md:hidden mb-8">
              <AuthLogo />
            </div>

            {/* Desktop top bar */}
            <div className="hidden md:flex justify-between items-center mb-[40px]">
              <div
                className="font-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--gry)",
                }}
              >
                Français · FR
              </div>
              <div className="text-sm" style={{ color: "var(--gry)" }}>
                Pas de compte ?{" "}
                <Link
                  href="/register"
                  className="font-medium"
                  style={{
                    color: "var(--main)",
                    borderBottom: "1px solid var(--main)",
                    paddingBottom: 2,
                  }}
                >
                  Créer un compte
                </Link>
              </div>
            </div>

            {/* Title — mobile version */}
            <div className="md:hidden mb-6">
              <div
                className="font-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--main)",
                  marginBottom: 8,
                }}
              >
                — Content de vous revoir —
              </div>
              <h1
                className="font-serif"
                style={{
                  fontSize: 34,
                  fontWeight: 400,
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  color: "var(--body)",
                  margin: 0,
                }}
              >
                Entrez dans votre{" "}
                <em style={{ color: "var(--main)", fontStyle: "italic" }}>
                  espace
                </em>
              </h1>
            </div>

            {/* Title — desktop version */}
            <div className="hidden md:block mb-6">
              <div
                className="font-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--main)",
                  marginBottom: 8,
                }}
              >
                — Content de vous revoir —
              </div>
              <h1
                className="font-serif"
                style={{
                  fontSize: 44,
                  fontWeight: 400,
                  lineHeight: 1.05,
                  letterSpacing: "-0.025em",
                  color: "var(--body)",
                  margin: 0,
                }}
              >
                Connectez-vous à votre{" "}
                <em style={{ color: "var(--main)", fontStyle: "italic" }}>
                  espace
                </em>
              </h1>
              <p
                className="font-sans"
                style={{
                  fontSize: 14,
                  color: "var(--gry)",
                  marginTop: 14,
                  lineHeight: 1.55,
                }}
              >
                Accédez à vos réservations, votre fidélité et vos factures en un
                clin d&apos;œil.
              </p>
            </div>

            {/* Social buttons — mobile: vertical, desktop: 2 cols */}
            <div
              className="flex flex-col gap-2.5 md:grid md:gap-2.5 mb-4"
              style={{ gridTemplateColumns: "1fr 1fr" }}
            >
              <SocialButton brand="apple" />
              <SocialButton brand="google" />
            </div>
            <AuthDivider text="OU PAR EMAIL" />

            {/* Form — single instance */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-4"
            >
              {errorBanner}
              <div className="flex flex-col gap-3.5">
                <AuthField
                  fieldId="email"
                  label="Email"
                  type="email"
                  placeholder="claire@exemple.fr"
                  iconName="mail"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <AuthField
                  fieldId="password"
                  label="Mot de passe"
                  type="password"
                  placeholder="••••••••"
                  iconName="lock"
                  rightContent={forgotLink}
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={rememberMe}
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center justify-center transition-colors"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    flexShrink: 0,
                    background: rememberMe ? "var(--main)" : "#fff",
                    border: rememberMe ? "none" : "1px solid var(--line)",
                  }}
                >
                  {rememberMe && (
                    <Icon name="check" size={12} stroke="#fff" sw={2.8} />
                  )}
                </button>
                <span
                  className="text-sm font-sans"
                  style={{ color: "var(--body)" }}
                >
                  Rester connecté sur cet appareil
                </span>
              </label>
              <SubmitButton loading={isLoading} mt={10}>
                Se connecter
              </SubmitButton>
            </form>

            {/* Register link — mobile only (desktop has it in top bar) */}
            <div
              className="md:hidden text-center text-sm mt-4"
              style={{ color: "var(--gry)" }}
            >
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="font-medium"
                style={{ color: "var(--main)" }}
              >
                Créer un compte
              </Link>
            </div>

            {/* Desktop footer */}
            <div
              className="hidden md:flex items-center justify-center gap-1.5 font-mono mt-auto pt-[40px]"
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                color: "var(--gry)",
                textTransform: "uppercase",
              }}
            >
              <Icon name="shield" size={10} stroke="var(--gry)" />
              PAIEMENT & DONNÉES SÉCURISÉS · RGPD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
