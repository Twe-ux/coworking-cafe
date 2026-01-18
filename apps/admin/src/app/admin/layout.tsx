import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { NotificationManager } from "@/components/NotificationManager";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Protection auth : seuls dev et admin peuvent accéder
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!["dev", "admin"].includes(session.user.role ?? "")) {
    redirect("/forbidden");
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
