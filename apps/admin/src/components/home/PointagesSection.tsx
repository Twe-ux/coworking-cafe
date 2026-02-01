import { TimeTrackingCardCompact } from "@/components/home/TimeTrackingCardCompact";
import type { Employee } from "@/types/hr";

interface PointagesSectionProps {
  employees: Employee[];
  onStatusChange: () => void;
}

/**
 * Section pointages de la page d'accueil
 * Affiche tous les employés actifs avec bouton start/stop
 */
export function PointagesSection({
  employees,
  onStatusChange,
}: PointagesSectionProps) {
  return (
    <>
      {employees.length > 0 ? (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {employees.map((employee) => (
            <TimeTrackingCardCompact
              key={employee.id}
              employee={employee}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-[100px] items-center justify-center text-muted-foreground">
          <p>Aucun employé actif</p>
        </div>
      )}
    </>
  );
}
