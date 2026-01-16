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

    // Si aucun filtre active n'est spécifié, montrer les actifs ET ceux en attente
    if (active !== null) {
      query.isActive = active === 'true'
    } else {
      // Par défaut, afficher seulement les employés actifs ou en attente (pas les inactifs)
      // On ne filtre pas ici car on va gérer cela après en vérifiant la date
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

    // Formater les données pour l'interface et filtrer
    const formattedEmployees = employees
      .map((employee: any) => {
      // Calculer le statut d'emploi
      let employmentStatus: 'draft' | 'waiting' | 'active' | 'inactive' = 'active'

      if (employee.isDraft) {
        employmentStatus = 'draft'
      } else if (!employee.isActive) {
        employmentStatus = 'inactive'
      } else if (employee.hireDate) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const hireDate = new Date(employee.hireDate)
        hireDate.setHours(0, 0, 0, 0)

        if (hireDate > today) {
          employmentStatus = 'waiting'
        }
      }

      // Générer une couleur par défaut si elle n'existe pas
      const colors = [
        '#3B82F6', // blue-500
        '#10B981', // green-500
        '#A855F7', // purple-500
        '#F97316', // orange-500
        '#EF4444', // red-500
        '#14B8A6', // teal-500
        '#6366F1', // indigo-500
        '#EC4899', // pink-500
        '#EAB308', // yellow-500
        '#06B6D4', // cyan-500
      ]

      // Convertir les classes Tailwind en couleurs hex si nécessaire
      const tailwindToHex: Record<string, string> = {
        'bg-blue-500': '#3B82F6',
        'bg-green-500': '#10B981',
        'bg-purple-500': '#A855F7',
        'bg-orange-500': '#F97316',
        'bg-red-500': '#EF4444',
        'bg-teal-500': '#14B8A6',
        'bg-indigo-500': '#6366F1',
        'bg-pink-500': '#EC4899',
        'bg-yellow-500': '#EAB308',
        'bg-cyan-500': '#06B6D4',
      }

      let employeeColor = employee.color
      if (!employeeColor) {
        // Pas de couleur définie, en générer une aléatoire
        employeeColor = colors[Math.floor(Math.random() * colors.length)]
      } else if (employeeColor.startsWith('bg-')) {
        // Convertir classe Tailwind en hex
        employeeColor = tailwindToHex[employeeColor] || employeeColor
      }
      // Si c'est déjà un hex, on garde tel quel
      const defaultColor = employeeColor

      return {
        _id: employee._id.toString(),
        id: employee._id.toString(),
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        role: employee.employeeRole,
        employeeRole: employee.employeeRole,
        color: defaultColor,
        clockingCode: employee.clockingCode,
        contractType: employee.contractType,
        contractualHours: employee.contractualHours,
        hireDate: employee.hireDate,
        endDate: employee.endDate,
        endContractReason: employee.endContractReason,
        isActive: employee.isActive,
        isDraft: employee.isDraft || false,
        employmentStatus,
        fullName: `${employee.firstName} ${employee.lastName}`,
        availability: employee.availability,
        onboardingStatus: employee.onboardingStatus,
        onboardingProgress: employee.getOnboardingProgress?.() || 0,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      }
    })
    .filter((employee) => {
      // Si aucun filtre active spécifié, exclure seulement les vraiment inactifs
      if (active === null) {
        return employee.employmentStatus !== 'inactive'
      }
      return true
    })

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
    if (!data.firstName || !data.lastName || !data.employeeRole) {
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
      employeeRole: data.employeeRole || 'Employé polyvalent',
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
      const field = Object.keys(error.keyPattern || {})[0]
      const fieldNames: Record<string, string> = {
        email: "cet email",
        socialSecurityNumber: "ce numéro de sécurité sociale",
        clockingCode: "ce code de pointage",
      }
      const fieldName = fieldNames[field] || "ces informations"

      return NextResponse.json(
        {
          success: false,
          error: `Un employé avec ${fieldName} existe déjà`,
          field,
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
