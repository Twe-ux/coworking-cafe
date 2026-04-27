"use client";

import Link from "next/link";

import {
  AuthBrandPanel,
  AuthDivider,
  AuthField,
  AuthLogo,
  AuthSecurityFooter,
  AuthTitle,
  ErrorAlert,
  SocialButton,
  SubmitButton,
} from "@/components/auth";
import { useLoginForm } from "./useLoginForm";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    errors,
    isLoading,
    errorMessage,
    submitError,
    onSubmit,
  } = useLoginForm();

  const displayError = submitError ?? errorMessage;

  return (
    <div className="auth-form-wrapper flex items-center justify-center min-h-screen px-8 pt-8 pb-6 md:p-8">
      <div className="w-full max-w-[400px] md:max-w-[1240px]">
        <div className="grid grid-cols-1 md:grid-cols-2 md:overflow-hidden md:rounded-[18px] md:bg-white md:shadow-[0_30px_60px_rgba(20,34,32,0.14),0_0_0_1px_var(--line)]">
          {/* Brand panel — desktop left column only */}
          <div className="hidden md:block h-full">
            <AuthBrandPanel mode="login" />
          </div>

          {/* Form column — always rendered once */}
          <div className="flex flex-col md:overflow-y-auto md:bg-white md:px-[60px] md:py-[44px]">
            {/* Mobile logo */}
            <div className="md:hidden mb-10">
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

            <AuthTitle
              eyebrow="— Content de vous revoir —"
              h1Mobile="Entrez dans votre espace"
              h1Desktop="Connectez-vous à votre espace"
              accentWord="espace"
              lead="Accédez à vos réservations, votre fidélité et vos factures en un clin d'œil."
            />

            {/* Social buttons — mobile: vertical, desktop: 2 cols */}
            <div
              className="flex flex-col gap-2.5 md:grid md:gap-2.5 mb-5"
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
              className="flex flex-col gap-5"
            >
              <ErrorAlert message={displayError} />
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
                  rightContent={
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
                  }
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>
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

            <AuthSecurityFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
