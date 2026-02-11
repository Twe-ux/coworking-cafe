/**
 * Schedule page header component
 * Displays title, description, and navigation to clocking-admin
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";

interface ScheduleHeaderProps {
  title?: string;
  description?: string;
}

export function ScheduleHeader({
  title = "Planning",
  description = "Gestion des créneaux de travail",
}: ScheduleHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
      <Button variant="outline" asChild>
        <Link href="/admin/hr/clocking-admin">
          <ClipboardList className="mr-2 h-4 w-4" />
          Pointages
        </Link>
      </Button>
    </div>
  );
}
