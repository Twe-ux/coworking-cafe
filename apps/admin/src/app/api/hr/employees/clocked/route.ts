import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { TimeEntry } from '@coworking-cafe/database';
import Employee from '@/models/employee';
import type { EmployeeInfo } from '@/types/cashRegister';
import type { Types } from 'mongoose';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Interface pour employé MongoDB avec lean()
 * Résultat de Employee.find().lean()
 */
interface EmployeeLeanDocument {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

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
      .lean<EmployeeLeanDocument[]>();

    // Formater au format EmployeeInfo
    const clockedEmployees: EmployeeInfo[] = employees.map((emp) => ({
      id: emp._id.toString(),
      firstName: emp.firstName,
      lastName: emp.lastName,
    }));

    return NextResponse.json({
      success: true,
      data: clockedEmployees,
      count: clockedEmployees.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching clocked employees:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des employés pointés',
        details: errorMessage,
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
