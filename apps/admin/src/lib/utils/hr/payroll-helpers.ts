/**
 * Payroll helpers for detecting monthly HR changes
 * Used by the payroll email system to attach contracts and resignation letters
 */

import type { Employee } from '@/types/hr';

// ==================== TYPES ====================

interface EmployeeWithContract {
  employee: Employee;
  contract: Buffer;
  dpaePdf?: Buffer;
}

interface EmployeeWithResignation {
  employee: Employee;
  resignationLetter?: Buffer;
}

export interface MonthlyChanges {
  newEmployees: EmployeeWithContract[];
  resignations: EmployeeWithResignation[];
}

// ==================== HELPERS ====================

/**
 * Check if a date string "YYYY-MM-DD" falls within a given month/year
 */
export function isDateInMonth(
  dateStr: string | undefined,
  month: number,
  year: number
): boolean {
  if (!dateStr) return false;
  const [y, m] = dateStr.split('-').map(Number);
  return y === year && m === month;
}

/**
 * Retrieve employment contract PDF from MongoDB
 * Returns the stored contract PDF or empty buffer if not found
 */
export async function getEmploymentContract(
  employee: Employee
): Promise<Buffer> {
  try {
    // Check if contract PDF exists in database
    if (!employee.contractPdf?.contentBase64) {
      console.warn(
        `[getContract] No contract PDF stored for ${employee.firstName} ${employee.lastName}`
      );
      return Buffer.alloc(0);
    }

    // Decode base64 to Buffer
    const contractBuffer = Buffer.from(employee.contractPdf.contentBase64, 'base64');

    console.log(
      `[getContract] Contract PDF retrieved for ${employee.firstName} ${employee.lastName}, size: ${contractBuffer.length} bytes`
    );

    return contractBuffer;
  } catch (error) {
    console.error('[getContract] ERROR:', {
      error: error instanceof Error ? error.message : String(error),
      employeeName: `${employee.firstName} ${employee.lastName}`,
    });
    return Buffer.alloc(0);
  }
}

/**
 * Decode a base64 resignation letter to Buffer
 */
function decodeResignationLetter(
  resignationLetter: Employee['resignationLetter']
): Buffer | undefined {
  if (!resignationLetter?.contentBase64) return undefined;
  return Buffer.from(resignationLetter.contentBase64, 'base64');
}

/**
 * Decode a base64 DPAE PDF to Buffer
 */
function decodeDpaePdf(
  dpae: Employee['dpae']
): Buffer | undefined {
  if (!dpae?.dpaePdf?.contentBase64) return undefined;
  return Buffer.from(dpae.dpaePdf.contentBase64, 'base64');
}

// ==================== MAIN FUNCTION ====================

/**
 * Detect new employees and resignations for a given month
 *
 * - New employees: hireDate within the month, not drafts
 * - Resignations: endDate within the month AND endContractReason === "démission"
 */
export async function detectMonthlyChanges(
  month: number,
  year: number
): Promise<MonthlyChanges> {
  const { connectMongoose } = await import('@/lib/mongodb');
  const { Employee: EmployeeModel } = await import('@/models/employee');

  await connectMongoose();

  // Date prefix for regex matching (e.g., "2026-03")
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

  console.log(`[detectMonthlyChanges] Searching for month: ${monthPrefix}`);

  // Query new employees hired this month
  const newEmployeeDocs = await EmployeeModel.find({
    hireDate: { $regex: `^${monthPrefix}` },
    isDraft: { $ne: true },
  });

  console.log(`[detectMonthlyChanges] Found ${newEmployeeDocs.length} new employees`);

  // Query resignations this month
  const resignationDocs = await EmployeeModel.find({
    endDate: { $regex: `^${monthPrefix}` },
    endContractReason: 'démission',
  });

  console.log(`[detectMonthlyChanges] Found ${resignationDocs.length} resignations`);

  // Process new employees - retrieve contract from DB (stored during client-side generation)
  const newEmployees: EmployeeWithContract[] = await Promise.all(
    newEmployeeDocs.map(async (doc) => {
      const employee = doc.toObject() as unknown as Employee;

      // Retrieve contract from database (no server-side generation)
      const contract = await getEmploymentContract(employee);

      if (contract.length === 0) {
        console.warn(
          `[detectMonthlyChanges] No contract PDF found in DB for ${employee.firstName} ${employee.lastName}. ` +
          `Contract must be generated via the onboarding interface first.`
        );
      }

      const dpaePdf = decodeDpaePdf(employee.dpae);

      return { employee, contract, dpaePdf };
    })
  );

  // Process resignations with letter decoding
  const resignations: EmployeeWithResignation[] = resignationDocs.map(
    (doc) => {
      const employee = doc.toObject() as unknown as Employee;
      const resignationLetter = decodeResignationLetter(
        employee.resignationLetter
      );
      return { employee, resignationLetter };
    }
  );

  return { newEmployees, resignations };
}
