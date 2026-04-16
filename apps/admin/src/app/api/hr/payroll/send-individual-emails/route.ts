import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sendEmail } from "@/lib/email/emailService";
import {
  buildIndividualPayrollSubject,
  buildIndividualPayrollHtml,
} from "@/lib/email/templates/individualPayrollEmail";

interface EmployeeEmailData {
  email: string;
  firstName: string;
  lastName: string;
  monthlyContractualHours: number;
  hoursWorked: number;
  paidLeaveHours: number;
  sickLeaveHours: number;
  overtimeHours: number;
}

interface SendIndividualEmailsPayload {
  employeesData: EmployeeEmailData[];
  month: number;
  year: number;
}

/**
 * POST /api/hr/payroll/send-individual-emails
 * Send individual hours recap email to each employee
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

    const payload: SendIndividualEmailsPayload = await request.json();
    const { employeesData, month, year } = payload;

    if (!employeesData?.length || !month || !year) {
      return NextResponse.json(
        { success: false, error: "Données manquantes" },
        { status: 400 }
      );
    }

    const subject = buildIndividualPayrollSubject(month, year);

    let sentCount = 0;
    const errors: string[] = [];

    for (const emp of employeesData) {
      if (!emp.email) continue;

      const html = buildIndividualPayrollHtml({
        firstName: emp.firstName,
        monthlyContractualHours: emp.monthlyContractualHours,
        hoursWorked: emp.hoursWorked,
        paidLeaveHours: emp.paidLeaveHours,
        sickLeaveHours: emp.sickLeaveHours,
        overtimeHours: emp.overtimeHours,
        month,
        year,
      });

      const result = await sendEmail({ to: emp.email, subject, html });

      if (result.success) {
        sentCount++;
        console.log(`[Individual Payroll] Sent to ${emp.firstName} ${emp.lastName} <${emp.email}>`);
      } else {
        errors.push(`${emp.firstName} ${emp.lastName}: ${result.error}`);
        console.error(`[Individual Payroll] Failed for ${emp.email}:`, result.error);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      totalCount: employeesData.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error sending individual payroll emails:", error);
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
