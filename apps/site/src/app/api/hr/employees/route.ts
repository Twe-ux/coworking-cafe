import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Employee } from "@/models/employee";
import { getServerSession } from "next-auth";
import { options as authOptions } from "@/lib/auth-options";

/**
 * GET /api/hr/employees
 * Get all employees (with filters)
 * Access: dev, admin, manager
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const contractType = searchParams.get("contractType");
    const employeeRole = searchParams.get("employeeRole");
    const includeDeleted = searchParams.get("includeDeleted");

    const query: any = {};

    // Si on ne demande pas explicitement les supprimés, on les exclut
    if (includeDeleted !== "true") {
      query.deletedAt = null;
    }

    if (isActive !== null) {
      query.isActive = isActive === "true";
    }

    if (contractType) {
      query.contractType = contractType;
    }

    if (employeeRole) {
      query.employeeRole = employeeRole;
    }

    const employees = await Employee.find(query).sort({ lastName: 1, firstName: 1 });

    return NextResponse.json({
      success: true,
      data: employees,
    });
  } catch (error) {    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des employés" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hr/employees
 * Create a new employee
 * Access: dev, admin, manager
 */
export async function POST(request: NextRequest) {
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

    // Validation des champs requis
    const requiredFields = [
      "firstName",
      "lastName",
      "dateOfBirth",
      "placeOfBirth",
      "address",
      "phone",
      "email",
      "socialSecurityNumber",
      "contractType",
      "contractualHours",
      "hireDate",
      "level",
      "step",
      "hourlyRate",
      "clockingCode",
      "employeeRole",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Le champ ${field} est requis` },
          { status: 400 }
        );
      }
    }

    // Vérifier que le code de pointage n'existe pas déjà
    const existingClockingCode = await Employee.findOne({
      clockingCode: body.clockingCode,
      deletedAt: null,
    });

    if (existingClockingCode) {
      return NextResponse.json(
        { success: false, error: "Ce code de pointage est déjà utilisé" },
        { status: 400 }
      );
    }

    // Vérifier que l'email n'existe pas déjà
    const existingEmail = await Employee.findOne({
      email: body.email,
      deletedAt: null,
    });

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Vérifier que le numéro de sécu n'existe pas déjà
    const existingSSN = await Employee.findOne({
      socialSecurityNumber: body.socialSecurityNumber,
      deletedAt: null,
    });

    if (existingSSN) {
      return NextResponse.json(
        { success: false, error: "Ce numéro de sécurité sociale est déjà utilisé" },
        { status: 400 }
      );
    }

    const employee = await Employee.create(body);

    return NextResponse.json(
      {
        success: true,
        data: employee,
        message: "Employé créé avec succès",
      },
      { status: 201 }
    );
  } catch (error: any) {    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la création de l'employé" },
      { status: 500 }
    );
  }
}
