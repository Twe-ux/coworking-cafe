/**
 * Schedule page header component
 * Displays title, description, and navigation to clocking-admin
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Calendar } from "lucide-react";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";

interface ScheduleHeaderProps {
  title?: string;
  description?: string;
}

export function ScheduleHeader({
  title = "Planning",
  description = "Gestion des créneaux de travail",
}: ScheduleHeaderProps) {
  const { counts } = useSidebarCounts();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="flex gap-2">
        <div className="relative">
          <Button variant="outline" asChild>
            <Link href="/admin/hr/absences">
              <Calendar className="mr-2 h-4 w-4" />
              Absences
            </Link>
          </Button>
          {counts.pendingAbsences > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center px-1.5 text-xs"
            >
              {counts.pendingAbsences}
            </Badge>
          )}
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/hr/clocking-admin">
            <ClipboardList className="mr-2 h-4 w-4" />
            Pointages
          </Link>
        </Button>
      </div>
    </div>
  );
}
