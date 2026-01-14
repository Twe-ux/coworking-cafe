import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Employee } from "@/types/hr";
import {
  calculateOnboardingProgress,
  formatDateFR,
  getEmployeeInitials,
  getEmployeeStatusBadge,
  getEndContractReasonLabel,
  isArchived,
} from "@/lib/utils/hr/employee-utils";
import { Edit, FileText, UserX } from "lucide-react";

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onViewContract: (employee: Employee) => void;
  onEndContract: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  showArchived?: boolean;
}

/**
 * Carte d'affichage d'un employé
 * Version compacte avec actions rapides
 */
export function EmployeeCard({
  employee,
  onEdit,
  onViewContract,
  onEndContract,
  onDelete,
  showArchived = false,
}: EmployeeCardProps) {
  const statusBadge = getEmployeeStatusBadge(employee);
  const onboardingProgress = calculateOnboardingProgress(employee);
  const archived = isArchived(employee);

  // Vue archivée simplifiée
  if (showArchived && archived) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300 text-lg font-semibold text-gray-600">
                {getEmployeeInitials(employee)}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {employee.firstName} {employee.lastName}
                </div>
                <div className="text-sm text-gray-500">{employee.employeeRole}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {employee.endDate ? formatDateFR(employee.endDate) : "Non renseignée"}
                </div>
                <div className="text-xs text-gray-500">
                  {getEndContractReasonLabel(employee.endContractReason)}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(employee)}
                  title="Voir les détails"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {employee.onboardingStatus?.step4Completed && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onViewContract(employee)}
                    title="Voir le contrat"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vue active complète
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${employee.employeeColor || "bg-primary"} text-lg font-semibold text-white`}
            >
              {getEmployeeInitials(employee)}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {employee.firstName} {employee.lastName}
              </div>
              <div className="text-sm text-gray-500">
                {employee.email} • {employee.phone}
              </div>
              <div className="mt-1 flex gap-2">
                <Badge variant="secondary">{employee.contractType}</Badge>
                <Badge variant="outline">
                  {employee.contractualHours ? `${employee.contractualHours}h` : 'N/A'}
                </Badge>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(employee)}
              title="Modifier"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {employee.onboardingStatus?.step4Completed && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onViewContract(employee)}
                title="Voir le contrat"
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEndContract(employee)}
              title="Fin de contrat / Archiver"
              className="text-orange-600 hover:text-orange-700"
            >
              <UserX className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progression onboarding */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Onboarding</span>
            <span className="font-medium">{onboardingProgress}%</span>
          </div>
          <Progress value={onboardingProgress} className="h-2" />
        </div>

        {/* Alerte fin de contrat future */}
        {employee.endDate && new Date(employee.endDate) > new Date() && (
          <div className="mt-3 rounded-md bg-orange-50 p-3 text-sm">
            <p className="font-medium text-orange-800">
              Fin de contrat prévue le {formatDateFR(employee.endDate)}
            </p>
            <p className="text-orange-600">
              {getEndContractReasonLabel(employee.endContractReason)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
