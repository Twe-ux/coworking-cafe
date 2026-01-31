import dynamic from "next/dynamic";

// Disable SSR for admin layout to avoid SessionProvider errors
const AdminLayoutClient = dynamic(
  () => import("./AdminLayoutClient").then((mod) => mod.AdminLayoutClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    ),
  }
);

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
