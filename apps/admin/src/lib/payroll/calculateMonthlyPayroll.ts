/**
 * Payroll calculation utilities
 * Calculates monthly hours, overtime, and payroll data for employees
 */

import type { Employee } from "@/types/hr";

export interface EmployeePayrollData {
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  addressLine1: string; // Street number and name
  addressLine2: string; // Postal code and city
  socialSecurityNumber: string; // Formatted SSN
  hireDate: string;
  endDate?: string;
  hourlyRate: number; // Hourly rate (€/hour)
  contractualHours: number; // Weekly contractual hours (e.g., 12h, 35h)
  monthlyContractualHours: number; // contractualHours × 4.33 (decimal format)
  hoursWorked: number; // Actual hours worked in the month (decimal format)
  paidLeaveHours: number; // Approved paid leave hours (CP) - PAID
  sickLeaveHours: number; // Approved sick leave hours (AM) - NOT paid by employer (sécu)
  unavailabilityHours: number; // Approved unavailability hours - NOT paid
  totalPaidHours: number; // hoursWorked + paidLeaveHours (decimal format)
  overtimeHours: number; // MAX(0, totalPaidHours - monthlyContractualHours) (decimal format)
  hasMutuelle: boolean; // Based on onboardingStatus.mutuelleCompleted
}

interface MonthlyHoursData {
  employeeId: string;
  totalHours: number;
}

interface MonthlyAbsencesData {
  employeeId: string;
  paidLeaveHours: number; // CP hours (paid)
  sickLeaveHours: number; // AM hours (not paid by employer)
  unavailabilityHours: number; // Indispo hours (not paid)
}

/**
 * Format employee address for PDF (2 lines)
 * Returns: { line1: "N° rue", line2: "Code postal Ville" }
 */
function formatAddress(employee: Employee): { line1: string; line2: string } {
  // Debug log
  console.log("Formatting address for", employee.firstName, employee.address);

  if (!employee.address) {
    return { line1: "Non renseignée", line2: "" };
  }

  const { street, postalCode, city } = employee.address;

  if (!street && !city) {
    return { line1: "Non renseignée", line2: "" };
  }

  const line1 = street || "";
  const line2 = `${postalCode || ""} ${city || ""}`.trim();

  return { line1, line2 };
}

/**
 * Format social security number with spaces: 1 23 45 67 890 123 45
 */
function formatSSN(ssn?: string): string {
  // Debug log
  console.log("Formatting SSN:", ssn);

  if (!ssn) return "Non renseigné";

  const cleaned = ssn.replace(/\s/g, "");
  if (cleaned.length === 15) {
    return `${cleaned[0]} ${cleaned.slice(1, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10, 13)} ${cleaned.slice(13, 15)}`;
  }

  return ssn;
}

/**
 * Calculate monthly payroll data for all employees
 * @param employees - List of employees
 * @param year - Year (YYYY)
 * @param month - Month (1-12)
 * @returns Array of employee payroll data
 */
export async function calculateMonthlyPayroll(
  employees: Employee[],
  year: number,
  month: number
): Promise<EmployeePayrollData[]> {
  // Calculate start and end dates for the month
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

  // Last day of month
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  // Fetch time entries for all employees in the month
  const monthlyHours = await fetchMonthlyHours(employees, startDate, endDate);

  // Fetch absences for all employees in the month
  const monthlyAbsences = await fetchMonthlyAbsences(employees, startDate, endDate);

  // Calculate payroll data for each employee
  const payrollData: EmployeePayrollData[] = employees.map((employee) => {
    // Debug: log employee data to check what fields are present
    console.log("🔍 Employee data:", {
      id: employee.id,
      name: employee.firstName,
      hasAddress: !!employee.address,
      address: employee.address,
      hasSSN: !!employee.socialSecurityNumber,
      ssn: employee.socialSecurityNumber,
    });

    const employeeHours = monthlyHours.find(
      (h) => h.employeeId === employee.id
    );
    const hoursWorked = employeeHours?.totalHours || 0;

    // Get absences data
    const employeeAbsences = monthlyAbsences.find(
      (a) => a.employeeId === employee.id
    );
    const paidLeaveHours = employeeAbsences?.paidLeaveHours || 0;
    const sickLeaveHours = employeeAbsences?.sickLeaveHours || 0;
    const unavailabilityHours = employeeAbsences?.unavailabilityHours || 0;

    /**
     * CALCUL DES HEURES PAYÉES ET SUPPLÉMENTAIRES
     *
     * Format : Toutes les heures sont en format DÉCIMAL (51.96h, pas 51h57)
     * - 1 mois = 4.33 semaines en moyenne (52 semaines / 12 mois)
     * - Heures contractuelles mensuelles = heures hebdomadaires × 4.33
     * - Exemple : 12h/semaine × 4.33 = 51.96h/mois (= 51h57min)
     *
     * Heures payées = Heures pointées + Congés payés (CP)
     * - CP : Payé (décompté du solde)
     * - AM : Pas payé par employeur (sécu sociale) - suivi uniquement
     * - Indispo : Pas payé - suivi uniquement
     *
     * Heures supplémentaires = MAX(0, heures payées - heures contractuelles mensuelles)
     * - Si employé fait moins que son contrat → 0 heures sup
     * - Si employé fait plus que son contrat → différence en heures sup
     */
    const monthlyContractualHours = employee.contractualHours * 4.33;
    const totalPaidHours = hoursWorked + paidLeaveHours;
    const overtimeHours = Math.max(0, totalPaidHours - monthlyContractualHours);

    const address = formatAddress(employee);

    return {
      employeeId: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: `${employee.firstName} ${employee.lastName}`,
      addressLine1: address.line1,
      addressLine2: address.line2,
      socialSecurityNumber: formatSSN(employee.socialSecurityNumber),
      hireDate: employee.hireDate,
      endDate: employee.endDate,
      hourlyRate: employee.hourlyRate,
      contractualHours: employee.contractualHours,
      monthlyContractualHours: Math.round(monthlyContractualHours * 100) / 100,
      hoursWorked: Math.round(hoursWorked * 100) / 100,
      paidLeaveHours: Math.round(paidLeaveHours * 100) / 100,
      sickLeaveHours: Math.round(sickLeaveHours * 100) / 100,
      unavailabilityHours: Math.round(unavailabilityHours * 100) / 100,
      totalPaidHours: Math.round(totalPaidHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      hasMutuelle: (() => {
        const mutuelleWanted = employee.onboardingStatus?.mutuelleWanted;
        const mutuelleCompleted = employee.onboardingStatus?.mutuelleCompleted;

        console.log("🔍 Mutuelle debug:", {
          employeeName: employee.firstName,
          mutuelleWanted,
          mutuelleCompleted,
          onboardingStatus: employee.onboardingStatus,
        });

        return mutuelleWanted ?? mutuelleCompleted ?? false;
      })(),
    };
  });

  return payrollData;
}

/**
 * Fetch and aggregate monthly hours for employees
 * @param employees - List of employees
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Array of employee IDs with total hours
 */
async function fetchMonthlyHours(
  employees: Employee[],
  startDate: string,
  endDate: string
): Promise<MonthlyHoursData[]> {
  const results: MonthlyHoursData[] = [];

  // Fetch time entries for each employee
  for (const employee of employees) {
    try {
      const response = await fetch(
        `/api/time-entries?employeeId=${employee.id}&startDate=${startDate}&endDate=${endDate}&limit=200`
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch time entries for employee ${employee.id}`
        );
        results.push({ employeeId: employee.id, totalHours: 0 });
        continue;
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        results.push({ employeeId: employee.id, totalHours: 0 });
        continue;
      }

      // Sum total hours from all time entries
      const totalHours = data.data.reduce(
        (sum: number, entry: { totalHours?: number }) =>
          sum + (entry.totalHours || 0),
        0
      );

      results.push({
        employeeId: employee.id,
        totalHours,
      });
    } catch (error) {
      console.error(
        `Error fetching time entries for employee ${employee.id}:`,
        error
      );
      results.push({ employeeId: employee.id, totalHours: 0 });
    }
  }

  return results;
}

/**
 * Fetch and aggregate monthly absences for employees
 * @param employees - List of employees
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Array of employee IDs with absence hours breakdown
 */
async function fetchMonthlyAbsences(
  employees: Employee[],
  startDate: string,
  endDate: string
): Promise<MonthlyAbsencesData[]> {
  const results: MonthlyAbsencesData[] = [];

  // Fetch absences for each employee
  for (const employee of employees) {
    try {
      const response = await fetch(
        `/api/hr/absences?employeeId=${employee.id}&status=approved&startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch absences for employee ${employee.id}`
        );
        results.push({
          employeeId: employee.id,
          paidLeaveHours: 0,
          sickLeaveHours: 0,
          unavailabilityHours: 0,
        });
        continue;
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        results.push({
          employeeId: employee.id,
          paidLeaveHours: 0,
          sickLeaveHours: 0,
          unavailabilityHours: 0,
        });
        continue;
      }

      // Sum hours by absence type
      const absences = data.data as Array<{
        type: "paid_leave" | "sick_leave" | "unavailability";
        totalHours: number;
      }>;

      const paidLeaveHours = absences
        .filter((a) => a.type === "paid_leave")
        .reduce((sum, a) => sum + a.totalHours, 0);

      const sickLeaveHours = absences
        .filter((a) => a.type === "sick_leave")
        .reduce((sum, a) => sum + a.totalHours, 0);

      const unavailabilityHours = absences
        .filter((a) => a.type === "unavailability")
        .reduce((sum, a) => sum + a.totalHours, 0);

      results.push({
        employeeId: employee.id,
        paidLeaveHours: Math.round(paidLeaveHours * 100) / 100,
        sickLeaveHours: Math.round(sickLeaveHours * 100) / 100,
        unavailabilityHours: Math.round(unavailabilityHours * 100) / 100,
      });
    } catch (error) {
      console.error(
        `Error fetching absences for employee ${employee.id}:`,
        error
      );
      results.push({
        employeeId: employee.id,
        paidLeaveHours: 0,
        sickLeaveHours: 0,
        unavailabilityHours: 0,
      });
    }
  }

  return results;
}
