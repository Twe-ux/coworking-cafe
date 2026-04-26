import { DashboardShell } from "@/components/dashboard/DashboardShell"
import type { DashboardSection } from "@/types/dashboard"
import { notFound } from "next/navigation"

const VALID_SECTIONS: DashboardSection[] = ["home", "reservations", "profile"]

export default function DashboardSectionPage({
  params,
}: {
  params: { section: string }
}) {
  if (!VALID_SECTIONS.includes(params.section as DashboardSection)) notFound()

  return <DashboardShell initialSection={params.section as DashboardSection} />
}
