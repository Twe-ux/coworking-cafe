"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AbsenceStatusBadge } from "./AbsenceStatusBadge";
import { AbsenceWeekPreview } from "./AbsenceWeekPreview";
import { Check, X, Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react";
import type { Absence } from "@/types/absence";
import { useState } from "react";
import { toast } from "sonner";

interface AbsenceCardProps {
  absence: Absence & {
    employeeId: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  onStatusChange?: () => void;
}

export function AbsenceCard({ absence, onStatusChange }: AbsenceCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const typeLabels = {
    unavailability: "Indisponibilité",
    paid_leave: "Congés payés (CP)",
    sick_leave: "Arrêt maladie (AM)",
  };

  const typeColors = {
    unavailability: "bg-blue-100 text-blue-800",
    paid_leave: "bg-green-100 text-green-800",
    sick_leave: "bg-red-100 text-red-800",
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleApprove = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/hr/absences/${absence._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Absence approuvée");
        onStatusChange?.();
      } else {
        toast.error(data.error || "Erreur lors de l'approbation");
      }
    } catch (error) {
      console.error("Error approving absence:", error);
      toast.error("Erreur de connexion");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Raison du refus (obligatoire) :");
    if (!reason) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/hr/absences/${absence._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Absence refusée");
        onStatusChange?.();
      } else {
        toast.error(data.error || "Erreur lors du refus");
      }
    } catch (error) {
      console.error("Error rejecting absence:", error);
      toast.error("Erreur de connexion");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Employee name */}
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">
                {absence.employeeId.firstName} {absence.employeeId.lastName}
              </h3>
              <AbsenceStatusBadge status={absence.status} />
            </div>

            {/* Type */}
            <Badge variant="outline" className={typeColors[absence.type]}>
              {typeLabels[absence.type]}
            </Badge>

            {/* Dates */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(absence.startDate)} →{" "}
                  {formatDate(absence.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{absence.totalHours.toFixed(2)}h</span>
              </div>
            </div>

            {/* Reason */}
            {absence.reason && (
              <p className="text-sm text-gray-600 italic">{absence.reason}</p>
            )}

            {/* Rejection reason */}
            {absence.status === "rejected" && absence.rejectionReason && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                <strong>Raison du refus :</strong> {absence.rejectionReason}
              </div>
            )}

            {/* Toggle preview button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="mt-2 border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
            >
              {showPreview ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Masquer le planning
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Voir le planning
                </>
              )}
            </Button>

            {/* Week preview */}
            {showPreview && (
              <AbsenceWeekPreview
                startDate={absence.startDate}
                endDate={absence.endDate}
                employeeId={absence.employeeId}
                affectedShifts={absence.affectedShifts}
              />
            )}
          </div>

          {/* Actions */}
          {absence.status === "pending" && (
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handleApprove}
                disabled={isUpdating}
                className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Approuver
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={isUpdating}
                className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Refuser
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
