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

  // Déterminer la classe de bordure selon le statut
  const getBorderClass = () => {
    if (employee.isDraft) return 'border-gray-300'

    switch (employee.employmentStatus) {
      case 'draft':
        return 'border-gray-300'
      case 'waiting':
        return 'border-l-4 border-l-orange-500'
      case 'active':
        return 'border-l-4 border-l-green-500'
      case 'inactive':
        return 'border-l-4 border-l-red-500'
      default:
        return 'border-l-4 border-l-green-500'
    }
  }

  // Vue active complète
  return (
    <Card className={getBorderClass()}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${employee.color || "bg-primary"} text-lg font-semibold text-white`}
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
                <Badge variant="outline" className="border-green-600 text-green-700 bg-green-50 font-medium">
                  {employee.contractType}
                </Badge>
                <Badge variant="outline" className="font-medium">
                  {employee.contractualHours ? `${employee.contractualHours}h` : 'N/A'}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-green-600 text-green-700 bg-green-50 font-medium"
                >
                  {statusBadge.label}
                </Badge>
                {employee.employmentStatus === 'waiting' && (
                  <Badge variant="outline" className="border-orange-500 text-orange-700 bg-orange-50 font-medium">
                    En attente
                  </Badge>
                )}
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

        {/* Progression intégration */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Intégration</span>
            <span className="font-semibold text-gray-900">{onboardingProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${onboardingProgress}%` }}
            />
          </div>
        </div>

        {/* Alerte employé en attente */}
        {employee.employmentStatus === 'waiting' && employee.hireDate && (
          <div className="mt-3 rounded-md bg-orange-50 p-3 text-sm">
            <p className="font-medium text-orange-800">
              Embauche prévue le {formatDateFR(employee.hireDate)}
            </p>
            <p className="text-orange-600">
              L'employé sera automatiquement activé à cette date
            </p>
          </div>
        )}

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
