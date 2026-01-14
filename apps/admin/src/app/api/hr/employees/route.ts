import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'

/**
 * GET /api/hr/employees - Récupérer tous les employés (avec données HR complètes)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (dev, admin ou staff pour lecture)
    const userRole = (session?.user as any)?.role
    if (!['dev', 'admin', 'staff'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    await connectMongoose()

    // Paramètres de recherche depuis l'URL
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const active = searchParams.get('active')
    const search = searchParams.get('search')

    // Paramètre pour inclure ou non les brouillons
    const includeDrafts = searchParams.get('includeDrafts') === 'true'

    // Construction de la requête
    const query: any = includeDrafts
      ? {} // Inclure tout (brouillons + employés)
      : {
          // Exclure les brouillons de la liste par défaut
          $or: [{ isDraft: { $exists: false } }, { isDraft: false }],
        }

    if (role) {
      query.role = role
    }

    if (active !== null) {
      query.isActive = active === 'true'
    }

    if (search) {
      query.$and = [
        {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        },
      ]
    }

    const employees = await Employee.find(query)
      .sort({ firstName: 1, lastName: 1 })
      .lean()

    // Formater les données pour l'interface
    const formattedEmployees = employees.map((employee: any) => ({
      _id: employee._id.toString(),
      id: employee._id.toString(),
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      employeeRole: employee.employeeRole,
      color: employee.color,
      clockingCode: employee.clockingCode,
      contractType: employee.contractType,
      contractualHours: employee.contractualHours,
      hireDate: employee.hireDate,
      endDate: employee.endDate,
      endContractReason: employee.endContractReason,
      isActive: employee.isActive,
      isDraft: employee.isDraft || false,
      fullName: `${employee.firstName} ${employee.lastName}`,
      onboardingStatus: employee.onboardingStatus,
      onboardingProgress: employee.getOnboardingProgress?.() || 0,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedEmployees,
      count: formattedEmployees.length,
    })
  } catch (error: any) {
    console.error('❌ Erreur API GET employees:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des employés',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/hr/employees - Créer un nouvel employé (avec données HR complètes)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (dev ou admin uniquement)
    const userRole = (session?.user as any)?.role
    if (!['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Validation des données obligatoires
    if (!data.firstName || !data.lastName || !data.role) {
      return NextResponse.json(
        { success: false, error: 'Prénom, nom et rôle sont obligatoires' },
        { status: 400 }
      )
    }

    await connectMongoose()

    // Créer le nouvel employé avec toutes les données
    const employeeData: any = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      role: data.role,
      employeeRole: data.employeeRole || 'Employé',
      clockingCode: data.clockingCode,
      color: data.color,
    }

    // Champs optionnels
    if (data.email) employeeData.email = data.email.trim()
    if (data.phone) employeeData.phone = data.phone.trim()
    if (data.dateOfBirth) employeeData.dateOfBirth = new Date(data.dateOfBirth)
    if (data.placeOfBirth) employeeData.placeOfBirth = data.placeOfBirth
    if (data.address) employeeData.address = data.address
    if (data.socialSecurityNumber)
      employeeData.socialSecurityNumber = data.socialSecurityNumber
    if (data.contractType) employeeData.contractType = data.contractType
    if (data.contractualHours)
      employeeData.contractualHours = data.contractualHours
    if (data.hireDate) employeeData.hireDate = new Date(data.hireDate)
    if (data.hireTime) employeeData.hireTime = data.hireTime
    if (data.level) employeeData.level = data.level
    if (data.step) employeeData.step = data.step
    if (data.hourlyRate) employeeData.hourlyRate = data.hourlyRate
    if (data.monthlySalary) employeeData.monthlySalary = data.monthlySalary
    if (data.availability) employeeData.availability = data.availability
    if (data.bankDetails) employeeData.bankDetails = data.bankDetails

    // Définir onboardingStatus avec tous les steps complétés
    employeeData.onboardingStatus = {
      step1Completed: true,
      step2Completed: true,
      step3Completed: true,
      step4Completed: true,
      contractGenerated: false,
      dpaeCompleted: false,
    }

    const newEmployee = new Employee(employeeData)
    await newEmployee.save()

    // Formater la réponse
    const formattedEmployee = {
      id: newEmployee._id.toString(),
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      email: newEmployee.email,
      phone: newEmployee.phone,
      role: newEmployee.role,
      employeeRole: newEmployee.employeeRole,
      color: newEmployee.color,
      clockingCode: newEmployee.clockingCode,
      isActive: newEmployee.isActive,
      fullName: `${newEmployee.firstName} ${newEmployee.lastName}`,
      createdAt: newEmployee.createdAt,
      updatedAt: newEmployee.updatedAt,
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Employé créé avec succès',
        data: formattedEmployee,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Erreur API POST employees:', error)

    // Gestion des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      )
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    // Gestion des erreurs de duplication
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un employé avec ces informations existe déjà',
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création de l'employé",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
