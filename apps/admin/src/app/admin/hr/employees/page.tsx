"use client";

import { AvailabilityCalendarTab } from "@/components/hr/availability/AvailabilityCalendarTab";
import { ContractGenerationModal } from "@/components/hr/contract/ContractGenerationModal";
import { EmployeeList } from "@/components/hr/employees";
import { DraftCard } from "@/components/hr/employees/DraftCard";
import { EndContractModal } from "@/components/hr/modals/EndContractModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHRManagement } from "@/hooks/hr/useHRManagement";
import { CalendarCheck2, FileText, Users } from "lucide-react";
import { Suspense } from "react";
import { HREmployeesPageSkeleton } from "./HREmployeesPageSkeleton";

/**
 * HR Management content component (uses useSearchParams)
 */
function HRManagementContent() {
  const {
    // Data
    session,
    activeTab,
    employees,
    drafts,
    loading,

    // Modal states
    selectedEmployee,
    endContractModalOpen,
    contractModalOpen,
    contractEmployee,

    // Actions
    handleCreateNew,
    handleEdit,
    handleViewContract,
    handleEndContract,
    handleDelete,
    handleDeleteDraft,
    handleEndContractConfirm,
    handleCloseEndContractModal,
    setContractModalOpen,
    handleTabChange,
  } = useHRManagement();

  // Loading state
  if (!session) {
    return <HREmployeesPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion RH</h1>
          <p className="text-muted-foreground">
            Gérez les employés, disponibilités, plannings et pointages
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employés
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <CalendarCheck2 className="h-4 w-4" />
            Disponibilités
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          {/* Section Brouillons */}
          {drafts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Brouillons en cours ({drafts.length})
                </h2>
              </div>
              <div className="grid gap-3">
                {drafts.map((draft) => (
                  <DraftCard
                    key={draft._id}
                    draft={draft}
                    onDelete={() => handleDeleteDraft(draft._id)}
                  />
                ))}
              </div>
              <div className="border-t pt-6" />
            </div>
          )}

          {/* Liste des employés */}
          <EmployeeList
            employees={employees}
            loading={loading}
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onViewContract={handleViewContract}
            onEndContract={handleEndContract}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <AvailabilityCalendarTab />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EndContractModal
        employee={selectedEmployee}
        open={endContractModalOpen}
        onClose={handleCloseEndContractModal}
        onConfirm={handleEndContractConfirm}
      />

      {contractEmployee && (
        <ContractGenerationModal
          employee={contractEmployee}
          open={contractModalOpen}
          onOpenChange={setContractModalOpen}
        />
      )}
    </div>
  );
}

/**
 * Page HR Management - Admin/Dev only
 * Onglets : Employés, Disponibilités
 */
export default function HRManagementPage() {
  return (
    <Suspense fallback={<HREmployeesPageSkeleton />}>
      <HRManagementContent />
    </Suspense>
  );
}
