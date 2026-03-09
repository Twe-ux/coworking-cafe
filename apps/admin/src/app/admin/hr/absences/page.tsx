"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  X,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Absence } from "@/types/absence";
import { AbsenceWeekPreview } from "@/components/hr/absences/AbsenceWeekPreview";
import { CreateUnavailabilityModal } from "@/components/hr/unavailability/CreateUnavailabilityModal";
import type { CreateUnavailabilityData } from "@/components/hr/unavailability/CreateUnavailabilityModal";
import type { Employee } from "@/types/hr";

type AbsenceWithEmployee = Absence & {
  employeeId: {
    _id?: string;
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

const typeLabels = {
  unavailability: "Indisponibilité",
  paid_leave: "Congés payés (CP)",
  sick_leave: "Arrêt maladie (AM)",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Refusée",
};

const statusColors: Record<string, string> = {
  pending: "bg-orange-50 text-orange-700 border-orange-500",
  approved: "bg-green-50 text-green-700 border-green-500",
  rejected: "bg-red-50 text-red-700 border-red-500",
};

function formatDateFr(dateStr: string): string {
  // Parse date as local time, not UTC
  // Input format: "YYYY-MM-DD"
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end date
}

export default function AbsencesPage() {
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("pending");
  const [requests, setRequests] = useState<AbsenceWithEmployee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<AbsenceWithEmployee | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit/Delete states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [absenceToEdit, setAbsenceToEdit] = useState<AbsenceWithEmployee | null>(null);
  const [absenceToDelete, setAbsenceToDelete] = useState<AbsenceWithEmployee | null>(null);

  const fetchRequests = async (status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) {
        params.set("status", status);
      }
      params.set("limit", "100");

      const url = params.toString()
        ? `/api/hr/absences?${params}`
        : "/api/hr/absences";
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/hr/employees?status=active");
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    // Fetch employees once
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Fetch based on active tab
    if (activeTab === "all") {
      fetchRequests();
    } else {
      fetchRequests(activeTab);
    }
  }, [activeTab]);

  const handleApprove = async (request: AbsenceWithEmployee) => {
    setSelectedRequest(request);
    setActionType("approve");
  };

  const handleReject = async (request: AbsenceWithEmployee) => {
    setSelectedRequest(request);
    setActionType("reject");
    setRejectionReason("");
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === "reject" && !rejectionReason.trim()) {
      toast.error("Veuillez indiquer le motif du refus");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/hr/absences/${selectedRequest._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: actionType === "approve" ? "approved" : "rejected",
          rejectionReason:
            actionType === "reject" ? rejectionReason : undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      toast.success(
        actionType === "approve"
          ? "Demande approuvée avec succès"
          : "Demande refusée"
      );

      // Refresh list
      if (activeTab === "all") {
        fetchRequests();
      } else {
        fetchRequests(activeTab);
      }

      // Close modal
      setSelectedRequest(null);
      setActionType(null);
      setRejectionReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAction = () => {
    setSelectedRequest(null);
    setActionType(null);
    setRejectionReason("");
  };

  const handleEdit = (request: AbsenceWithEmployee) => {
    setAbsenceToEdit(request);
    setIsEditModalOpen(true);
  };

  const handleDelete = (request: AbsenceWithEmployee) => {
    setAbsenceToDelete(request);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmEdit = async (data: CreateUnavailabilityData) => {
    if (!absenceToEdit) return;

    try {
      setIsSubmitting(true);

      // Convert legacy type format to new API format
      const apiData = {
        ...data,
        type: data.type === 'vacation' ? 'paid_leave'
          : data.type === 'sick' ? 'sick_leave'
          : 'unavailability'
      };

      const response = await fetch(`/api/hr/absences/${absenceToEdit._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la modification");
      }

      toast.success("Absence modifiée avec succès");
      setIsEditModalOpen(false);
      setAbsenceToEdit(null);

      // Refresh list
      if (activeTab === "all") {
        fetchRequests();
      } else {
        fetchRequests(activeTab);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!absenceToDelete) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/hr/absences/${absenceToDelete._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la suppression");
      }

      toast.success("Absence supprimée avec succès");
      setIsDeleteConfirmOpen(false);
      setAbsenceToDelete(null);

      // Refresh list
      if (activeTab === "all") {
        fetchRequests();
      } else {
        fetchRequests(activeTab);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Count by status
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Demandes d'absence</h1>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const filteredRequests =
    activeTab === "all"
      ? requests
      : requests.filter((r) => r.status === activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Demandes d'absence</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les demandes d'absence de vos employés
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="relative">
            En attente
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="relative">
            Approuvées
            {approvedCount > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({approvedCount})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="relative">
            Refusées
            {rejectedCount > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({rejectedCount})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">
            Toutes
            {requests.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({requests.length})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  {activeTab === "pending" && "Aucune demande en attente"}
                  {activeTab === "approved" && "Aucune demande approuvée"}
                  {activeTab === "rejected" && "Aucune demande refusée"}
                  {activeTab === "all" && "Aucune demande"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const days = calculateDays(request.startDate, request.endDate);
                const isPending = request.status === "pending";

                return (
                  <Card
                    key={request._id}
                    className={`border-l-4 ${
                      request.status === "pending"
                        ? "border-l-orange-500"
                        : request.status === "approved"
                          ? "border-l-green-500"
                          : "border-l-red-500"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between gap-4">
                        {/* Nom et statut */}
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-xl">
                            {request.employeeId.firstName}{" "}
                            {request.employeeId.lastName}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={statusColors[request.status]}
                          >
                            {request.status === "pending" && (
                              <Clock className="mr-1 h-3 w-3" />
                            )}
                            {request.status === "approved" && (
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                            )}
                            {request.status === "rejected" && (
                              <XCircle className="mr-1 h-3 w-3" />
                            )}
                            {statusLabels[request.status]}
                          </Badge>
                        </div>

                        {/* Infos sur une ligne */}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-1">
                          <Badge variant="secondary">
                            {typeLabels[request.type]}
                          </Badge>
                          <span>•</span>
                          <span>{request.employeeId.email}</span>
                          <span>•</span>
                          <span className="font-medium text-foreground">
                            {formatDateFr(request.startDate)} →{" "}
                            {formatDateFr(request.endDate)}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-foreground">
                            {days} jour{days > 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex gap-2 flex-shrink-0">
                          {isPending ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(request)}
                                className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approuver
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(request)}
                                className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Refuser
                              </Button>
                            </>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(request)}
                            className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(request)}
                            className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Motif si présent */}
                      {request.reason && (
                        <div className="rounded-lg bg-muted p-3">
                          <div className="flex items-center gap-2 text-sm font-medium mb-1">
                            <FileText className="h-4 w-4" />
                            <span>Motif</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {request.reason}
                          </p>
                        </div>
                      )}

                      {/* Motif du refus si rejeté */}
                      {request.status === "rejected" &&
                        request.rejectionReason && (
                          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                            <div className="flex items-center gap-2 text-sm font-medium mb-1 text-red-700">
                              <AlertTriangle className="h-4 w-4" />
                              <span>Motif du refus</span>
                            </div>
                            <p className="text-sm text-red-700">
                              {request.rejectionReason}
                            </p>
                          </div>
                        )}

                      {/* Planning d'équipe (seulement pour les demandes en attente) */}
                      {isPending && (
                        <AbsenceWeekPreview
                          startDate={request.startDate}
                          endDate={request.endDate}
                          employeeId={request.employeeId}
                          affectedShifts={request.affectedShifts}
                        />
                      )}

                      {/* Info d'approbation */}
                      {request.status === "approved" && request.approvedAt && (
                        <div className="text-sm text-muted-foreground">
                          Approuvée le{" "}
                          {new Date(request.approvedAt).toLocaleDateString(
                            "fr-FR"
                          )}{" "}
                          à{" "}
                          {new Date(request.approvedAt).toLocaleTimeString(
                            "fr-FR",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Modal */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  actionType === "approve" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {actionType === "approve" ? (
                  <Check className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {actionType === "approve"
                    ? "Approuver la demande"
                    : "Refuser la demande"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.employeeId.firstName}{" "}
                  {selectedRequest.employeeId.lastName}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p>
                  <strong>Période :</strong>{" "}
                  {formatDateFr(selectedRequest.startDate)} →{" "}
                  {formatDateFr(selectedRequest.endDate)}
                </p>
                <p className="mt-1">
                  <strong>Type :</strong> {typeLabels[selectedRequest.type]}
                </p>
              </div>

              {actionType === "reject" && (
                <div>
                  <Label htmlFor="rejection-reason">Motif du refus *</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Expliquez pourquoi cette demande est refusée..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelAction}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                variant="outline"
                className={`flex-1 ${
                  actionType === "reject"
                    ? "border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
                    : "border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
                }`}
                onClick={handleConfirmAction}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Traitement..." : "Confirmer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {absenceToEdit && (
        <CreateUnavailabilityModal
          isOpen={isEditModalOpen}
          employees={employees}
          onClose={() => {
            setIsEditModalOpen(false);
            setAbsenceToEdit(null);
          }}
          onCreate={handleConfirmEdit}
          editData={{
            id: absenceToEdit._id,
            employeeId:
              typeof absenceToEdit.employeeId === "string"
                ? absenceToEdit.employeeId
                : absenceToEdit.employeeId._id || absenceToEdit.employeeId.id,
            startDate: absenceToEdit.startDate,
            endDate: absenceToEdit.endDate,
            type:
              absenceToEdit.type === "paid_leave"
                ? "vacation"
                : absenceToEdit.type === "sick_leave"
                  ? "sick"
                  : "personal",
            reason: absenceToEdit.reason,
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && absenceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
                <p className="text-sm text-gray-500">Cette action est irréversible</p>
              </div>
            </div>

            <p className="mb-6 text-sm text-gray-700">
              Êtes-vous sûr de vouloir supprimer cette absence ?
              <br />
              <span className="font-medium">
                {typeof absenceToDelete.employeeId === "object"
                  ? `${absenceToDelete.employeeId.firstName} ${absenceToDelete.employeeId.lastName}`
                  : "Employé"}
              </span>
              {" "}du{" "}
              <span className="font-medium">{formatDateFr(absenceToDelete.startDate)}</span>
              {" "}au{" "}
              <span className="font-medium">{formatDateFr(absenceToDelete.endDate)}</span>
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setAbsenceToDelete(null);
                }}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Suppression..." : "Confirmer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
