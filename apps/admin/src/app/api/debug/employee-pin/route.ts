import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'

/**
 * GET /api/debug/employee-pin?employeeId=XXX&pin=0703
 * Debug endpoint pour tester la vérification du PIN d'un employé
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get('employeeId')
    const pin = searchParams.get('pin')

    if (!employeeId || !pin) {
      return NextResponse.json({
        success: false,
        error: 'employeeId et pin sont requis',
        usage: '/api/debug/employee-pin?employeeId=XXX&pin=0703',
      })
    }

    await connectMongoose()

    const employee = await Employee.findById(employeeId)

    if (!employee) {
      return NextResponse.json({
        success: false,
        error: 'Employé introuvable',
        employeeId,
      })
    }

    // Debug info
    const debug = {
      employeeId: employee._id.toString(),
      firstName: employee.firstName,
      lastName: employee.lastName,
      isActive: employee.isActive,
      clockingCode: employee.clockingCode,
      clockingCodeType: typeof employee.clockingCode,
      clockingCodeLength: employee.clockingCode?.length,
      pinProvided: pin,
      pinType: typeof pin,
      pinLength: pin.length,
      directComparison: employee.clockingCode === pin,
      hasVerifyPinMethod: typeof employee.verifyPin === 'function',
    }

    // Test de la méthode verifyPin
    let verifyPinResult = null
    let verifyPinError = null

    try {
      if (typeof employee.verifyPin === 'function') {
        verifyPinResult = employee.verifyPin(pin)
      } else {
        verifyPinError = 'Méthode verifyPin non disponible'
      }
    } catch (err: any) {
      verifyPinError = err.message
    }

    return NextResponse.json({
      success: true,
      debug,
      verifyPinResult,
      verifyPinError,
      conclusion:
        employee.clockingCode === pin
          ? '✅ Le PIN devrait être valide (comparaison directe OK)'
          : '❌ Le PIN ne correspond pas',
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    })
  }
}
