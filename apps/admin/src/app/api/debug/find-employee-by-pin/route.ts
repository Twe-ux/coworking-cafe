import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'

/**
 * GET /api/debug/find-employee-by-pin?pin=0703
 * Trouver un employé par son clockingCode
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pin = searchParams.get('pin')

    if (!pin) {
      return NextResponse.json({
        success: false,
        error: 'pin est requis',
        usage: '/api/debug/find-employee-by-pin?pin=0703',
      })
    }

    await connectMongoose()

    const employee = await Employee.findOne({ clockingCode: pin })

    if (!employee) {
      return NextResponse.json({
        success: false,
        error: 'Aucun employé trouvé avec ce PIN',
        pin,
      })
    }

    return NextResponse.json({
      success: true,
      employee: {
        id: employee._id.toString(),
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        isActive: employee.isActive,
        clockingCode: employee.clockingCode,
        employeeRole: employee.employeeRole,
      },
      testURL: `/api/debug/employee-pin?employeeId=${employee._id.toString()}&pin=${pin}`,
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        stack: error.stack,
      })
    }
    return NextResponse.json({
      success: false,
      error: 'Unknown error',
      stack: undefined,
    })
  }
}
