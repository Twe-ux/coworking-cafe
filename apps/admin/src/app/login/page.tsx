import { LoginForm } from "@/components/login-form";
import Image from "next/image";
import logoCircle from "@/../public/logo/logo-circle.webp";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <Image
            src={logoCircle}
            alt="CoworKing Café Logo"
            width={40}
            height={40}
            className="object-cover rounded-full"
          />
          <span className="text-xl font-semibold">CoworKing Café</span>
        </a>
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
