"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { NotificationManager } from "@/components/NotificationManager";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protection auth : seuls dev et admin peuvent accéder
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (!["dev", "admin"].includes(session.user.role ?? "")) {
      router.push("/forbidden");
    }
  }, [session, status, router]);

  // Afficher un loader pendant la vérification
  if (status === "loading" || !session?.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="w-full overflow-x-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 pl-20 mt-5 md:pl-20">
            <DynamicBreadcrumb />
          </div>
        </header>
        <main className="flex-1 w-full pt-4 pr-0 md:pr-8 md:pl-24 ">
          {children}
        </main>
      </SidebarInset>
      {/* Gestionnaire de notifications PWA */}
      <NotificationManager />
    </SidebarProvider>
  );
}
