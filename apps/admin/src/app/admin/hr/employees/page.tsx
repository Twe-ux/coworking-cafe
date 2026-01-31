import dynamic from "next/dynamic";
import { HREmployeesPageSkeleton } from "./HREmployeesPageSkeleton";

// Disable SSR for this component to avoid SessionProvider errors
const HRManagementContent = dynamic(
  () => import("./HRManagementContent").then((mod) => mod.HRManagementContent),
  {
    ssr: false,
    loading: () => <HREmployeesPageSkeleton />,
  }
);

/**
 * Page HR Management - Admin/Dev only
 * Onglets : Employés, Disponibilités
 */
export default function HRManagementPage() {
  return <HRManagementContent />;
}
