import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Employee } from "@/models/employee";

/**
 * GET /api/hr/employees/debug
 * Debug endpoint to see all employees including deleted ones
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Récupérer TOUS les employés, y compris ceux avec deletedAt
    const allEmployees = await Employee.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      total: allEmployees.length,
      data: allEmployees.map(emp => ({
        _id: emp._id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        isActive: emp.isActive,
        deletedAt: emp.deletedAt,
        endDate: emp.endDate,
        endContractReason: emp.endContractReason,
      })),
    });
  } catch (error) {    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}
