import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { detectMonthlyChanges } from "@/lib/utils/hr/payroll-helpers";
import {
  buildPayrollSubject,
  buildPayrollEmailHtml,
} from "@/lib/email/templates/payrollEmail";

interface PreviewPayload {
  month: number;
  year: number;
  pdfSize?: number; // Size of the main PDF in bytes
}

interface AttachmentPreview {
  filename: string;
  size: number; // Size in bytes
  type: "payroll" | "contract" | "dpae" | "resignation";
}

interface PreviewResponse {
  success: boolean;
  subject?: string;
  htmlBody?: string;
  attachments?: AttachmentPreview[];
  hasContract?: boolean;
  hasResignation?: boolean;
  hasDpae?: boolean;
  error?: string;
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

/**
 * POST /api/hr/payroll/preview
 * Preview email content and attachments WITHOUT sending
 */
export async function POST(request: NextRequest): Promise<NextResponse<PreviewResponse>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const userRole = session?.user?.role;
    if (!userRole || !["dev", "admin"].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Accès refusé - Administrateurs uniquement" },
        { status: 403 }
      );
    }

    const payload: PreviewPayload = await request.json();
    const { month, year, pdfSize = 0 } = payload;

    if (!month || !year) {
      return NextResponse.json(
        { success: false, error: "Mois et année requis" },
        { status: 400 }
      );
    }

    const monthName = MONTH_NAMES[month - 1];

    // Detect monthly changes (new employees, resignations)
    const monthlyChanges = await detectMonthlyChanges(month, year);

    console.log(`[Payroll Preview] Month: ${month}/${year}`);
    console.log(`[Payroll Preview] New employees found: ${monthlyChanges.newEmployees.length}`);
    console.log(`[Payroll Preview] Resignations found: ${monthlyChanges.resignations.length}`);

    // Log details of new employees
    monthlyChanges.newEmployees.forEach((emp) => {
      console.log(`[Payroll Preview] New employee: ${emp.employee.firstName} ${emp.employee.lastName}`);
      console.log(`  - hireDate: ${emp.employee.hireDate}`);
      console.log(`  - isDraft: ${emp.employee.isDraft}`);
      console.log(`  - contract size: ${emp.contract?.length || 0} bytes`);
      console.log(`  - DPAE uploaded: ${!!emp.employee.dpae?.dpaePdf}`);
    });

    // Build attachments preview list
    const attachments: AttachmentPreview[] = [
      {
        filename: `paie-${month}-${year}.pdf`,
        size: pdfSize,
        type: "payroll",
      },
    ];

    let hasContract = false;
    let hasResignation = false;
    let hasDpae = false;

    // Add contract attachments for ALL new employees
    monthlyChanges.newEmployees.forEach((newEmp) => {
      const nameSlug = `${newEmp.employee.firstName}-${newEmp.employee.lastName}`.toLowerCase();

      if (newEmp.contract && newEmp.contract.length > 0) {
        attachments.push({
          filename: `contrat-${nameSlug}.pdf`,
          size: newEmp.contract.length,
          type: "contract",
        });
        hasContract = true;
      }

      if (newEmp.dpaePdf && newEmp.dpaePdf.length > 0) {
        attachments.push({
          filename: `dpae-${nameSlug}.pdf`,
          size: newEmp.dpaePdf.length,
          type: "dpae",
        });
        hasDpae = true;
      }
    });

    // Add resignation letters for ALL resignations
    monthlyChanges.resignations.forEach((resignation) => {
      const nameSlug = `${resignation.employee.firstName}-${resignation.employee.lastName}`.toLowerCase();

      if (resignation.resignationLetter && resignation.resignationLetter.length > 0) {
        attachments.push({
          filename: `demission-${nameSlug}.pdf`,
          size: resignation.resignationLetter.length,
          type: "resignation",
        });
        hasResignation = true;
      }
    });

    // Build email subject and body
    const subject = buildPayrollSubject({
      monthName,
      year,
      hasContract,
      hasResignation,
      hasDpae,
    });

    const htmlBody = buildPayrollEmailHtml({
      monthName,
      year,
      hasContract,
      hasResignation,
      hasDpae,
    });

    return NextResponse.json({
      success: true,
      subject,
      htmlBody,
      attachments,
      hasContract,
      hasResignation,
      hasDpae,
    });
  } catch (error) {
    console.error("Error previewing payroll email:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
      },
      { status: 500 }
    );
  }
}
