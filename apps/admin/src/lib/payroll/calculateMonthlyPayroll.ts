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
  contractualHours: number;
  monthlyContractualHours: number; // contractualHours × 4.33
  hoursWorked: number; // Actual hours worked in the month
  overtimeHours: number; // MAX(0, hoursWorked - monthlyContractualHours)
  hasMutuelle: boolean; // Based on onboardingStatus.mutuelleCompleted
}

interface MonthlyHoursData {
  employeeId: string;
  totalHours: number;
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

    // Monthly contractual hours = weekly hours × 4.33
    const monthlyContractualHours = employee.contractualHours * 4.33;

    // Overtime = MAX(0, hours worked - monthly contractual)
    const overtimeHours = Math.max(0, hoursWorked - monthlyContractualHours);

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
      contractualHours: employee.contractualHours,
      monthlyContractualHours: Math.round(monthlyContractualHours * 100) / 100,
      hoursWorked: Math.round(hoursWorked * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      hasMutuelle:
        employee.onboardingStatus?.mutuelleWanted ??
        employee.onboardingStatus?.mutuelleCompleted ??
        false,
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
