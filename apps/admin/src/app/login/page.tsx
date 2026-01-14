import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
        <p className="text-xs text-center text-muted-foreground">
          - dev@coworkingcafe.fr / Dev@1234 <br />
          - admin@coworkingcafe.fr / Admin@123 <br />- staff@coworkingcafe.fr /
          Staff@123
        </p>
      </div>
    </div>
  );
}
