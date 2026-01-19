import { PINLoginForm } from "@/components/pin-login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <PINLoginForm />
        <p className="text-xs text-center text-muted-foreground">
          PIN Dev: 111111 <br />
          PIN Admin: 222222
        </p>
      </div>
    </div>
  );
}
