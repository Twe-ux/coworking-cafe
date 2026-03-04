import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectMongoose } from "@/lib/mongodb";
import Employee from "@/models/employee";

/**
 * GET /api/hr/payroll/debug-employees?month=3&year=2026
 * Debug endpoint to check employees in DB
 */
export async function GET(request: NextRequest) {
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
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");

    if (!month || !year) {
      return NextResponse.json(
        { success: false, error: "month et year requis" },
        { status: 400 }
      );
    }

    await connectMongoose();

    const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;

    // Find all employees with hireDate matching the month
    const allEmployees = await Employee.find({
      hireDate: { $regex: `^${monthPrefix}` },
    })
      .select("firstName lastName hireDate isDraft isActive dpae onboardingStatus")
      .lean();

    // Find employees that match the payroll query
    const payrollEmployees = await Employee.find({
      hireDate: { $regex: `^${monthPrefix}` },
      isDraft: { $ne: true },
    })
      .select("firstName lastName hireDate isDraft isActive dpae onboardingStatus")
      .lean();

    return NextResponse.json({
      success: true,
      searchCriteria: {
        month,
        year,
        monthPrefix,
        query: {
          hireDate: { $regex: `^${monthPrefix}` },
          isDraft: { $ne: true },
        },
      },
      results: {
        allEmployeesWithMatchingHireDate: allEmployees.length,
        employeesMatchingPayrollQuery: payrollEmployees.length,
        allEmployees: allEmployees.map((emp) => ({
          name: `${emp.firstName} ${emp.lastName}`,
          hireDate: emp.hireDate,
          isDraft: emp.isDraft,
          isActive: emp.isActive,
          hasDpae: !!emp.dpae?.dpaePdf,
          dpaeCompleted: emp.dpae?.completed || false,
          onboardingStep4: emp.onboardingStatus?.step4Completed || false,
        })),
        payrollEmployees: payrollEmployees.map((emp) => ({
          name: `${emp.firstName} ${emp.lastName}`,
          hireDate: emp.hireDate,
          isDraft: emp.isDraft,
          isActive: emp.isActive,
          hasDpae: !!emp.dpae?.dpaePdf,
        })),
      },
    });
  } catch (error) {
    console.error("Error in debug-employees:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
