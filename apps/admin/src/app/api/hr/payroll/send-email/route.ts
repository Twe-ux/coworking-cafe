import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sendEmail } from "@/lib/email/emailService";
import { detectMonthlyChanges } from "@/lib/utils/hr/payroll-helpers";
import {
  buildPayrollSubject,
  buildPayrollEmailHtml,
} from "@/lib/email/templates/payrollEmail";

interface SendEmailPayload {
  recipientEmail: string;
  pdfBase64: string;
  month: number;
  year: number;
  employeeId?: string;
  employeeName?: string;
}

interface PayrollAttachment {
  filename: string;
  content: Buffer;
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

/**
 * Build attachments array: always payroll PDF, optionally contract, resignation letter, and trial termination letter
 */
async function buildAttachments(
  payload: SendEmailPayload,
  pdfBuffer: Buffer
): Promise<{
  attachments: PayrollAttachment[];
  hasContract: boolean;
  hasResignation: boolean;
  hasTrialTermination: boolean;
  hasDpae: boolean;
}> {
  const { month, year, employeeId, employeeName } = payload;
  const nameSlug = employeeName || "employe";

  const attachments: PayrollAttachment[] = [
    {
      filename: `paie-${nameSlug}-${month}-${year}.pdf`,
      content: pdfBuffer,
    },
  ];

  let hasContract = false;
  let hasResignation = false;
  let hasTrialTermination = false;
  let hasDpae = false;

  const monthlyChanges = await detectMonthlyChanges(month, year);

  // If employeeId is provided, attach documents for that specific employee
  if (employeeId) {
    const newEmp = monthlyChanges.newEmployees.find(
      (e) => String(e.employee._id) === String(employeeId)
    );
    if (newEmp && newEmp.contract.length > 0) {
      attachments.push({
        filename: `contrat-${nameSlug}.pdf`,
        content: newEmp.contract,
      });
      hasContract = true;
    }

    if (newEmp?.dpaePdf && newEmp.dpaePdf.length > 0) {
      attachments.push({
        filename: `dpae-${nameSlug}.pdf`,
        content: newEmp.dpaePdf,
      });
      hasDpae = true;
    }

    const resignation = monthlyChanges.resignations.find(
      (e) => String(e.employee._id) === String(employeeId)
    );
    if (resignation?.resignationLetter) {
      attachments.push({
        filename: `demission-${nameSlug}.pdf`,
        content: resignation.resignationLetter,
      });
      hasResignation = true;
    }

    const trialTermination = monthlyChanges.trialPeriodTerminations.find(
      (e) => String(e.employee._id) === String(employeeId)
    );
    if (trialTermination?.trialPeriodTerminationLetter) {
      attachments.push({
        filename: `rupture-periode-essai-${nameSlug}.pdf`,
        content: trialTermination.trialPeriodTerminationLetter,
      });
      hasTrialTermination = true;
    }
  } else {
    // No employeeId → attach ALL contracts and resignations for the month
    monthlyChanges.newEmployees.forEach((newEmp) => {
      const empNameSlug = `${newEmp.employee.firstName}-${newEmp.employee.lastName}`.toLowerCase();

      if (newEmp.contract && newEmp.contract.length > 0) {
        attachments.push({
          filename: `contrat-${empNameSlug}.pdf`,
          content: newEmp.contract,
        });
        hasContract = true;
      }

      if (newEmp.dpaePdf && newEmp.dpaePdf.length > 0) {
        attachments.push({
          filename: `dpae-${empNameSlug}.pdf`,
          content: newEmp.dpaePdf,
        });
        hasDpae = true;
      }
    });

    monthlyChanges.resignations.forEach((resignation) => {
      const empNameSlug = `${resignation.employee.firstName}-${resignation.employee.lastName}`.toLowerCase();

      if (resignation.resignationLetter && resignation.resignationLetter.length > 0) {
        attachments.push({
          filename: `demission-${empNameSlug}.pdf`,
          content: resignation.resignationLetter,
        });
        hasResignation = true;
      }
    });

    monthlyChanges.trialPeriodTerminations.forEach((trialTermination) => {
      const empNameSlug = `${trialTermination.employee.firstName}-${trialTermination.employee.lastName}`.toLowerCase();

      if (trialTermination.trialPeriodTerminationLetter && trialTermination.trialPeriodTerminationLetter.length > 0) {
        attachments.push({
          filename: `rupture-periode-essai-${empNameSlug}.pdf`,
          content: trialTermination.trialPeriodTerminationLetter,
        });
        hasTrialTermination = true;
      }
    });
  }

  return { attachments, hasContract, hasResignation, hasTrialTermination, hasDpae };
}

/**
 * POST /api/hr/payroll/send-email
 * Send payroll PDF by email with optional contract and resignation letter
 */
export async function POST(request: NextRequest) {
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

    const payload: SendEmailPayload = await request.json();
    const { recipientEmail, pdfBase64, month, year } = payload;

    if (!recipientEmail || !pdfBase64 || !month || !year) {
      return NextResponse.json(
        { success: false, error: "Données manquantes" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { success: false, error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    const monthName = MONTH_NAMES[month - 1];
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    // Build attachments with optional contract/resignation letter/trial termination letter/DPAE
    const { attachments, hasContract, hasResignation, hasTrialTermination, hasDpae } =
      await buildAttachments(payload, pdfBuffer);

    console.log(
      `[Payroll Email] Sending to ${recipientEmail} | ` +
        `${attachments.length} attachment(s)` +
        `${hasContract ? " [+contract]" : ""}` +
        `${hasDpae ? " [+DPAE]" : ""}` +
        `${hasResignation ? " [+resignation]" : ""}` +
        `${hasTrialTermination ? " [+trial termination]" : ""}`
    );

    const subject = buildPayrollSubject({
      monthName,
      year,
      hasContract,
      hasResignation,
      hasTrialTermination,
      hasDpae,
    });
    const html = buildPayrollEmailHtml({
      monthName,
      year,
      hasContract,
      hasResignation,
      hasTrialTermination,
      hasDpae,
    });

    const result = await sendEmail({
      to: recipientEmail,
      subject,
      html,
      attachments,
    });

    if (!result.success) {
      console.error("Email sending error:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de l'envoi de l'email",
          details: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email envoyé à ${recipientEmail}`,
      attachmentCount: attachments.length,
      hasContract,
      hasResignation,
      hasTrialTermination,
      hasDpae,
    });
  } catch (error) {
    console.error("Error sending payroll email:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
