import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Employee } from "@/types/hr";
import { calculateOnboardingProgress, getEmployeeInitials } from "@/lib/utils/hr/employee-utils";
import { Edit, Trash2, FileEdit } from "lucide-react";
import { useRouter } from "next/navigation";

interface DraftCardProps {
  draft: Employee;
  onDelete: () => void;
}

/**
 * Carte d'affichage d'un brouillon d'employé
 */
export function DraftCard({ draft, onDelete }: DraftCardProps) {
  const router = useRouter();
  const onboardingProgress = calculateOnboardingProgress(draft);

  const handleContinue = () => {
    router.push("/admin/hr/employees/new");
  };

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-200 text-lg font-semibold text-orange-800">
              {draft.firstName && draft.lastName
                ? getEmployeeInitials(draft)
                : <FileEdit className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="font-medium text-gray-900">
                  {draft.firstName && draft.lastName
                    ? `${draft.firstName} ${draft.lastName}`
                    : "Brouillon sans nom"}
                </div>
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                  Brouillon
                </Badge>
              </div>
              {draft.email && (
                <div className="text-sm text-gray-500">{draft.email}</div>
              )}
              {draft.contractType && (
                <div className="mt-1">
                  <Badge variant="secondary">{draft.contractType}</Badge>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleContinue}
              title="Continuer la création"
              className="border-orange-300 hover:bg-orange-100"
            >
              <Edit className="h-4 w-4 text-orange-700" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              title="Supprimer le brouillon"
              className="border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Progression onboarding */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Progression</span>
            <span className="font-medium text-orange-700">{onboardingProgress}%</span>
          </div>
          <Progress value={onboardingProgress} className="h-2" />
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Dernière modification : {new Date(draft.updatedAt || '').toLocaleDateString('fr-FR')}
        </div>
      </CardContent>
    </Card>
  );
}
