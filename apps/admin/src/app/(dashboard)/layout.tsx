import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="w-full overflow-x-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 pl-20 mt-5 md:pl-20">
            {/* <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" /> */}
            <DynamicBreadcrumb />
          </div>
        </header>
        <main className="flex-1 w-full pt-4 pr-0 md:pr-8 md:pl-24 ">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
