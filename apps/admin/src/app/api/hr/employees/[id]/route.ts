import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Employee } from "@/models/employee";
import { getServerSession } from "next-auth";
import { options as authOptions } from "@/lib/auth-options";

/**
 * GET /api/hr/employees/[id]
 * Get a single employee by ID
 * Access: dev, admin, manager
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    // TODO: Vérifier les permissions (dev, admin, manager)

    await connectDB();

    const employee = await Employee.findOne({
      _id: params.id,
      deletedAt: null,
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employé non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération de l'employé" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/hr/employees/[id]
 * Update an employee
 * Access: dev, admin, manager
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    // TODO: Vérifier les permissions (dev, admin, manager)

    await connectDB();

    const body = await request.json();

    const employee = await Employee.findOne({
      _id: params.id,
      deletedAt: null,
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employé non trouvé" },
        { status: 404 }
      );
    }

    // Si l'email change, vérifier qu'il n'est pas déjà utilisé
    if (body.email && body.email !== employee.email) {
      const existingEmail = await Employee.findOne({
        email: body.email,
        _id: { $ne: params.id },
        deletedAt: null,
      });

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: "Cet email est déjà utilisé" },
          { status: 400 }
        );
      }
    }

    // Si le code de pointage change, vérifier qu'il n'est pas déjà utilisé
    if (body.clockingCode && body.clockingCode !== employee.clockingCode) {
      const existingCode = await Employee.findOne({
        clockingCode: body.clockingCode,
        _id: { $ne: params.id },
        deletedAt: null,
      });

      if (existingCode) {
        return NextResponse.json(
          { success: false, error: "Ce code de pointage est déjà utilisé" },
          { status: 400 }
        );
      }
    }

    // Si le numéro de sécu change, vérifier qu'il n'est pas déjà utilisé
    if (body.socialSecurityNumber && body.socialSecurityNumber !== employee.socialSecurityNumber) {
      const existingSSN = await Employee.findOne({
        socialSecurityNumber: body.socialSecurityNumber,
        _id: { $ne: params.id },
        deletedAt: null,
      });

      if (existingSSN) {
        return NextResponse.json(
          { success: false, error: "Ce numéro de sécurité sociale est déjà utilisé" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour les champs en gérant correctement les objets imbriqués
    if (body.workSchedule) {
      employee.workSchedule = {
        ...employee.workSchedule,
        ...body.workSchedule,
      };
      employee.markModified('workSchedule');
      delete body.workSchedule;
    }

    if (body.onboardingStatus) {
      employee.onboardingStatus = {
        ...employee.onboardingStatus,
        ...body.onboardingStatus,
      };
      employee.markModified('onboardingStatus');
      delete body.onboardingStatus;
    }

    Object.assign(employee, body);
    await employee.save();
    return NextResponse.json({
      success: true,
      data: employee,
      message: "Employé mis à jour avec succès",
    });
  } catch (error: any) {    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la mise à jour de l'employé" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hr/employees/[id]
 * Soft delete an employee
 * Access: dev, admin
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    // TODO: Vérifier les permissions (dev, admin uniquement)

    await connectDB();

    const employee = await Employee.findOne({
      _id: params.id,
      deletedAt: null,
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employé non trouvé" },
        { status: 404 }
      );
    }

    employee.deletedAt = new Date();
    employee.isActive = false;
    await employee.save();

    return NextResponse.json({
      success: true,
      message: "Employé supprimé avec succès",
    });
  } catch (error) {    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de l'employé" },
      { status: 500 }
    );
  }
}
