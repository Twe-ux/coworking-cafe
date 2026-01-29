import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import mongoose from 'mongoose';
import '@/models/employee';
import bcrypt from 'bcrypt';
import type { EmployeeRole } from '@/types/hr';

interface PromoteRequest {
  newRole: EmployeeRole;
  pin: string;
}

/**
 * PUT /api/hr/employees/[id]/promote
 * Change employee role (promote to admin or demote to staff)
 * - Promote: Set admin role (Manager/Assistant manager) and create PIN
 * - Demote: Set to "Employé polyvalent" and remove PIN
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Auth: only dev/admin can change employee roles
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    await connectMongoose();

    const Employee = mongoose.model('Employee');
    const { newRole, pin }: PromoteRequest = await request.json();

    // Validation
    if (!newRole || !['Manager', 'Assistant manager', 'Employé polyvalent'].includes(newRole)) {
      return errorResponse(
        'Rôle invalide',
        'Le nouveau rôle doit être Manager, Assistant manager ou Employé polyvalent',
        400
      );
    }

    const isDemoting = newRole === 'Employé polyvalent';

    // PIN validation only for promotion to admin
    if (!isDemoting) {
      if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        return errorResponse(
          'PIN invalide',
          'Le PIN doit être composé de 6 chiffres',
          400
        );
      }
    }

    // Find employee
    const employee = await Employee.findById(params.id);
    if (!employee) {
      return errorResponse('Employé introuvable', 'Cet employé n\'existe pas', 404);
    }

    // Update employee
    employee.employeeRole = newRole;

    if (isDemoting) {
      // Remove PIN when demoting to staff
      employee.dashboardPinHash = undefined;
      await employee.save();

      console.log(`✅ Employee ${employee.firstName} ${employee.lastName} demoted to ${newRole}`);

      return successResponse(
        {
          id: employee._id.toString(),
          employeeRole: employee.employeeRole,
          message: `Employé rétrogradé au rôle ${newRole} avec succès`,
        },
        `Employé rétrogradé au rôle ${newRole} avec succès`
      );
    } else {
      // Hash the PIN for admin promotion
      const saltRounds = 10;
      const dashboardPinHash = await bcrypt.hash(pin, saltRounds);
      employee.dashboardPinHash = dashboardPinHash;
      await employee.save();

      console.log(`✅ Employee ${employee.firstName} ${employee.lastName} promoted to ${newRole}`);

      return successResponse(
        {
          id: employee._id.toString(),
          employeeRole: employee.employeeRole,
          message: `Employé promu au rôle ${newRole} avec succès`,
        },
        `Employé promu au rôle ${newRole} avec succès`
      );
    }

  } catch (error) {
    console.error('PUT /api/hr/employees/[id]/promote error:', error);
    return errorResponse(
      'Erreur lors du changement de rôle',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}
