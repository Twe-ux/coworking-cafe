import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { TimeEntry } from '@coworking-cafe/database';
import Employee from '@/models/employee';
import type { EmployeeInfo } from '@/types/cashRegister';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/hr/employees/clocked
 * Récupère les employés actuellement pointés (avec time entry actif aujourd'hui)
 * PUBLIC - Accessible sans authentification (pour le dashboard staff)
 */
export async function GET(request: NextRequest) {
  try {
    await connectMongoose();

    // Date du jour en format YYYY-MM-DD
    const today = getTodayDate();

    // Trouver tous les TimeEntry actifs (clockOut === null) pour aujourd'hui
    const activeTimeEntries = await TimeEntry.find({
      date: today,
      clockOut: null,
    }).lean();

    if (activeTimeEntries.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    // Extraire les IDs des employés pointés
    const employeeIds = activeTimeEntries.map(entry => entry.employeeId);

    // Récupérer les employés correspondants
    const employees = await Employee.find({
      _id: { $in: employeeIds },
      isActive: true,
    })
      .select('_id firstName lastName')
      .sort({ firstName: 1, lastName: 1 })
      .lean();

    // Formater au format EmployeeInfo
    const clockedEmployees: EmployeeInfo[] = employees.map((emp: any) => ({
      id: emp._id.toString(),
      firstName: emp.firstName,
      lastName: emp.lastName,
    }));

    return NextResponse.json({
      success: true,
      data: clockedEmployees,
      count: clockedEmployees.length,
    });
  } catch (error: any) {
    console.error('Error fetching clocked employees:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des employés pointés',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper
function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
