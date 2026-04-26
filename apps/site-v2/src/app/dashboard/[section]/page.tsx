import { DashboardShell } from "@/components/dashboard/DashboardShell"
import type { DashboardSection } from "@/types/dashboard"
import { notFound } from "next/navigation"

const VALID_SECTIONS: DashboardSection[] = ["home", "reservations", "profile"]

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  if (!VALID_SECTIONS.includes(section as DashboardSection)) notFound()

  return <DashboardShell initialSection={section as DashboardSection} />
}
