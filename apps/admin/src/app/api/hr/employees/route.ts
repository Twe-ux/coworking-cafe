import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'
import { parseAndValidate } from '@/lib/api/validation'
import { createEmployeeSchema } from '@/lib/validations/employee'
import type { Employee as EmployeeType } from '@/types/hr'

/**
 * GET /api/hr/employees - Récupérer tous les employés (avec données HR complètes)
 * Public endpoint - accessible without authentication for staff pages (clocking)
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    // No auth required for reading employees (staff clocking page is public)
    await connectMongoose()

    // 🔧 ACTIVATION AUTOMATIQUE des employés dont la date d'embauche est arrivée
    // Vérifie et active automatiquement les employés dont hireDate <= aujourd'hui
    // Utilise Europe/Paris timezone pour éviter les décalages (serveur = UTC)
    const now = new Date()
    const parisDate = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now).split('/').reverse().join('-')  // DD/MM/YYYY → YYYY-MM-DD

    const todayStr = parisDate

    console.log('🔍 [AUTO-ACTIVATION] Date du jour (Paris):', todayStr)

    // Vérifier quels employés correspondent aux critères AVANT activation
    const employeesToActivate = await Employee.find({
      hireDate: { $lte: todayStr },
      isActive: false,
      isDraft: false,
    }).select('firstName lastName hireDate isActive').lean()

    if (employeesToActivate.length > 0) {
      console.log(`📋 [AUTO-ACTIVATION] ${employeesToActivate.length} employé(s) à activer:`,
        employeesToActivate.map(e => `${e.firstName} ${e.lastName} (hireDate: ${e.hireDate})`))
    } else {
      console.log('ℹ️ [AUTO-ACTIVATION] Aucun employé à activer')
    }

    const activationResult = await Employee.updateMany(
      {
        hireDate: { $lte: todayStr },
        isActive: false,
        isDraft: false,
      },
      {
        $set: {
          isActive: true,
        },
      }
    )

    // Log si des employés ont été activés
    if (activationResult.modifiedCount > 0) {
      console.log(`✅ [AUTO-ACTIVATION] ${activationResult.modifiedCount} employé(s) activé(s) avec succès`)
    }

    // Paramètres de recherche depuis l'URL
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const active = searchParams.get('active')
    const search = searchParams.get('search')

    // Paramètre pour inclure ou non les brouillons
    const includeDrafts = searchParams.get('includeDrafts') === 'true'

    // Construction de la requête
    interface QueryFilter {
      role?: string;
      isActive?: boolean;
      isDraft?: boolean;
      $or?: Array<{ isDraft: { $exists: boolean } } | { isDraft: boolean }>;
      $and?: Array<{
        $or: Array<
          | { firstName: { $regex: string; $options: string } }
          | { lastName: { $regex: string; $options: string } }
          | { email: { $regex: string; $options: string } }
        >;
      }>;
    }

    const query: QueryFilter = includeDrafts
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
    interface LeanEmployee {
      _id: { toString: () => string };
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      employeeRole: string;
      color?: string;
      clockingCode?: string;
      contractType: string;
      contractualHours: number;
      hireDate: string;
      endDate?: string;
      endContractReason?: string;
      isActive: boolean;
      isDraft?: boolean;
      availability?: EmployeeType['availability'];
      onboardingStatus?: EmployeeType['onboardingStatus'];
      getOnboardingProgress?: () => number;
      createdAt?: Date;
      updatedAt?: Date;
    }

    const formattedEmployees = employees
      .map((employee: LeanEmployee) => {
      // Calculer le statut d'emploi
      let employmentStatus: 'draft' | 'waiting' | 'active' | 'inactive' = 'active'

      if (employee.isDraft) {
        employmentStatus = 'draft'
      } else if (employee.hireDate) {
        // Vérifier d'abord la date d'embauche (prioritaire sur isActive)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const hireDate = new Date(employee.hireDate)
        hireDate.setHours(0, 0, 0, 0)

        if (hireDate > today) {
          employmentStatus = 'waiting'
        } else if (employee.isActive) {
          employmentStatus = 'active'
        } else {
          employmentStatus = 'inactive'
        }
      } else if (!employee.isActive) {
        employmentStatus = 'inactive'
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
  } catch (error: unknown) {
    console.error('❌ Erreur API GET employees:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des employés',
        details: errorMessage,
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
    const userRole = session?.user?.role
    if (!userRole || !['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    // Validate request body with Zod
    const validation = await parseAndValidate(request, createEmployeeSchema)
    if (!validation.success) {
      return validation.response
    }

    const data = validation.data

    await connectMongoose()

    // Prepare employee data with proper date conversion
    const employeeData = {
      firstName: data.firstName,
      lastName: data.lastName,
      employeeRole: data.employeeRole,
      clockingCode: data.clockingCode,
      color: data.color,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth, // String YYYY-MM-DD (convention CLAUDE.md)
      placeOfBirth: data.placeOfBirth,
      nationality: data.nationality,
      address: data.address,
      socialSecurityNumber: data.socialSecurityNumber,
      contractType: data.contractType,
      contractualHours: data.contractualHours,
      hireDate: data.hireDate, // String YYYY-MM-DD (convention CLAUDE.md)
      hireTime: data.hireTime,
      endDate: data.endDate, // String YYYY-MM-DD ou undefined
      endContractReason: data.endContractReason,
      level: data.level,
      step: data.step,
      hourlyRate: data.hourlyRate,
      monthlySalary: data.monthlySalary,
      availability: data.availability,
      bankDetails: data.bankDetails,
      // Définir onboardingStatus avec tous les steps complétés
      onboardingStatus: {
        step1Completed: true,
        step2Completed: true,
        step3Completed: true,
        step4Completed: true,
        contractGenerated: false,
        dpaeCompleted: false,
        bankDetailsProvided: false,
        contractSent: false,
      },
    }

    const newEmployee = new Employee(employeeData)
    await newEmployee.save()

    // Formater la réponse avec TOUTES les données nécessaires au contrat
    const formattedEmployee = {
      _id: newEmployee._id.toString(),
      id: newEmployee._id.toString(),
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      fullName: `${newEmployee.firstName} ${newEmployee.lastName}`,
      email: newEmployee.email,
      phone: newEmployee.phone,
      dateOfBirth: newEmployee.dateOfBirth,
      placeOfBirth: newEmployee.placeOfBirth,
      nationality: newEmployee.nationality,
      address: newEmployee.address,
      socialSecurityNumber: newEmployee.socialSecurityNumber,
      contractType: newEmployee.contractType,
      contractualHours: newEmployee.contractualHours,
      hireDate: newEmployee.hireDate,
      hireTime: newEmployee.hireTime,
      endDate: newEmployee.endDate,
      endContractReason: newEmployee.endContractReason,
      level: newEmployee.level,
      step: newEmployee.step,
      hourlyRate: newEmployee.hourlyRate,
      monthlySalary: newEmployee.monthlySalary,
      employeeRole: newEmployee.employeeRole,
      availability: newEmployee.availability,
      onboardingStatus: newEmployee.onboardingStatus,
      workSchedule: newEmployee.workSchedule,
      bankDetails: newEmployee.bankDetails,
      clockingCode: newEmployee.clockingCode,
      color: newEmployee.color,
      isActive: newEmployee.isActive,
      isDraft: newEmployee.isDraft,
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
  } catch (error: unknown) {
    console.error('❌ Erreur API POST employees:', error)

    // Type guard pour erreur Mongoose ValidationError
    interface MongooseValidationError extends Error {
      name: 'ValidationError';
      errors: Record<string, { message: string }>;
    }

    // Type guard pour erreur Mongoose duplicate key
    interface MongoDuplicateError extends Error {
      code: number;
      keyPattern?: Record<string, number>;
    }

    // Gestion des erreurs de validation Mongoose
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationError = error as MongooseValidationError;
      const validationErrors = Object.values(validationError.errors).map(
        (err) => err.message
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
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      const duplicateError = error as MongoDuplicateError;
      const field = Object.keys(duplicateError.keyPattern || {})[0]
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

    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création de l'employé",
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
