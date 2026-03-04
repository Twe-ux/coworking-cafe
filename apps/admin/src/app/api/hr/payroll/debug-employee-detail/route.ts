import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectMongoose } from "@/lib/mongodb";
import Employee from "@/models/employee";

/**
 * GET /api/hr/payroll/debug-employee-detail?id=xxx
 * Get full employee data for debugging
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id requis" },
        { status: 400 }
      );
    }

    await connectMongoose();

    const employee = await Employee.findById(id).lean();

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employé non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employee: {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        dateOfBirth: employee.dateOfBirth,
        placeOfBirth: employee.placeOfBirth,
        nationality: employee.nationality,
        address: employee.address,
        phone: employee.phone,
        email: employee.email,
        socialSecurityNumber: employee.socialSecurityNumber,
        contractType: employee.contractType,
        contractualHours: employee.contractualHours,
        hireDate: employee.hireDate,
        hireTime: employee.hireTime,
        endDate: employee.endDate,
        level: employee.level,
        step: employee.step,
        hourlyRate: employee.hourlyRate,
        monthlySalary: employee.monthlySalary,
        employeeRole: employee.employeeRole,
        clockingCode: employee.clockingCode,
        color: employee.color,
        isDraft: employee.isDraft,
        isActive: employee.isActive,
        onboardingStatus: employee.onboardingStatus,
        dpae: employee.dpae,
        workSchedule: employee.workSchedule,
        availability: employee.availability,
      },
      // Highlight potential issues
      validation: {
        hasFirstName: !!employee.firstName,
        hasLastName: !!employee.lastName,
        hasDateOfBirth: !!employee.dateOfBirth,
        hasPlaceOfBirth: !!employee.placeOfBirth,
        placeOfBirthType: typeof employee.placeOfBirth,
        hasAddress: !!employee.address,
        addressType: typeof employee.address,
        hasHourlyRate: !!employee.hourlyRate,
        hasContractualHours: !!employee.contractualHours,
        hasDpaeDate: !!employee.onboardingStatus?.dpaeCompletedAt,
        dpaeDate: employee.onboardingStatus?.dpaeCompletedAt,
      },
    });
  } catch (error) {
    console.error("Error in debug-employee-detail:", error);
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
