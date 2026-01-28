import type { Employee, AvailabilityDay } from "@/types/hr";

/**
 * Utilitaires pour le module Employees
 * Limite : <150 lignes selon CLAUDE.md
 */

/**
 * Calculer la progression de l'onboarding (0-100%)
 */
export function calculateOnboardingProgress(employee: Employee): number {
  if (!employee.onboardingStatus) {
    return 0;
  }

  const steps = [
    employee.onboardingStatus.step1Completed,
    employee.onboardingStatus.step2Completed,
    employee.onboardingStatus.step3Completed,
    employee.onboardingStatus.step4Completed,
  ];

  const completed = steps.filter(Boolean).length;
  return Math.round((completed / steps.length) * 100);
}

/**
 * Calculer le salaire mensuel brut
 */
export function calculateMonthlySalary(
  hourlyRate: number,
  contractualHours: number
): string {
  return (hourlyRate * contractualHours * 4.33).toFixed(2);
}

/**
 * Formater une date ISO en format français
 */
export function formatDateFR(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("fr-FR");
}

/**
 * Valider le numéro de sécurité sociale (15 chiffres)
 */
export function validateSSN(ssn: string): boolean {
  return /^\d{15}$/.test(ssn);
}

/**
 * Valider le code de pointage (4 chiffres)
 */
export function validateClockingCode(code: string): boolean {
  return /^\d{4}$/.test(code);
}

/**
 * Calculer les heures disponibles pour un jour
 */
export function calculateDayHours(day: AvailabilityDay): number {
  if (!day.available || !day.slots.length) return 0;

  return day.slots.reduce((total, slot) => {
    const [startH, startM] = slot.start.split(":").map(Number);
    const [endH, endM] = slot.end.split(":").map(Number);
    const hours = endH - startH + (endM - startM) / 60;
    return total + hours;
  }, 0);
}

/**
 * Obtenir le badge couleur selon le statut de l'employé
 */
export function getEmployeeStatusBadge(employee: Employee): {
  variant: "default" | "destructive" | "secondary" | "outline";
  label: string;
} {
  if (!employee.isActive) {
    return { variant: "destructive", label: "Archivé" };
  }

  if (employee.endDate && new Date(employee.endDate) > new Date()) {
    return { variant: "outline", label: "Fin prévue" };
  }

  return { variant: "default", label: "Actif" };
}

/**
 * Vérifier si l'employé est archivé
 * Un employé en attente (hireDate future) n'est PAS considéré comme archivé
 */
export function isArchived(employee: Employee): boolean {
  // Si l'employé est supprimé, il est archivé
  if (employee.deletedAt) return true;

  // Si l'employé est en attente (embauche future), il n'est PAS archivé
  if (employee.employmentStatus === 'waiting' || employee.status === 'waiting') {
    return false;
  }

  // Si l'employé est inactif, il est archivé
  return !employee.isActive;
}

/**
 * Obtenir le label du motif de fin de contrat
 */
export function getEndContractReasonLabel(
  reason?: "démission" | "fin-periode-essai" | "rupture"
): string {
  if (!reason) return "Non renseigné";

  const labels = {
    démission: "Démission",
    "fin-periode-essai": "Fin de période d'essai",
    rupture: "Rupture",
  };

  return labels[reason];
}

/**
 * Générer une couleur aléatoire pour un employé
 */
export function generateEmployeeColor(): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Obtenir les initiales d'un employé
 */
export function getEmployeeInitials(employee: Employee): string {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
}

/**
 * Filtrer les employés selon les critères
 */
export function filterEmployees(
  employees: Employee[],
  filters: {
    search?: string;
    showArchived?: boolean;
    contractType?: string;
    role?: string;
  }
): Employee[] {
  return employees.filter((emp) => {
    // Filtre archivés
    if (!filters.showArchived && isArchived(emp)) return false;
    if (filters.showArchived && !isArchived(emp)) return false;

    // Filtre recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      if (!fullName.includes(searchLower) && !emp.email.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Filtre type de contrat
    if (filters.contractType && emp.contractType !== filters.contractType) {
      return false;
    }

    // Filtre rôle
    if (filters.role && emp.employeeRole !== filters.role) {
      return false;
    }

    return true;
  });
}
