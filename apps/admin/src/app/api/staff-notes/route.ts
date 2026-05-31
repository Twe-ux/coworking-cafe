import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import { StaffNote } from '@/models/staffNote'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import type { StaffNote as StaffNoteType, StaffNoteCreateData } from '@/types/staffNote'
import mongoose, { type Types } from 'mongoose'
import '@/models/employee'
import type { EmployeeDocument } from '@/models/employee/document'

export const dynamic = 'force-dynamic'

/**
 * GET /api/staff-notes
 * destination=staff → public (dashboard staff)
 * destination=admin → requires admin auth (admin page)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const destination = searchParams.get('destination') as 'staff' | 'admin' | null
  const includeRead = searchParams.get('includeRead') === 'true'

  if (destination === 'admin') {
    const authResult = await requireAuth(['dev', 'admin'])
    if (!authResult.authorized) return authResult.response
  }

  await connectMongoose()

  const filter: Record<string, unknown> = {}
  if (destination) filter.destination = destination
  if (!includeRead) filter.isRead = false

  const notes = await StaffNote.find(filter).sort({ createdAt: -1 }).lean()

  const formatted: StaffNoteType[] = notes.map((n) => ({
    id: (n._id as Types.ObjectId).toString(),
    destination: n.destination,
    content: n.content,
    senderEmployeeId: n.senderEmployeeId,
    senderName: n.senderName,
    isRead: n.isRead,
    readAt: n.readAt,
    createdAt: n.createdAt.toISOString(),
  }))

  return successResponse(formatted)
}

/**
 * POST /api/staff-notes
 * Validates clockingCode (4-digit plain text) against Employee.clockingCode
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectMongoose()

    const body: StaffNoteCreateData = await request.json()
    const { destination, content, pin } = body

    if (!destination || !['staff', 'admin'].includes(destination)) {
      return errorResponse('Destination invalide', 'destination must be staff or admin', 400)
    }
    if (!content?.trim()) return errorResponse('Le message est requis', 'content missing', 400)
    if (!pin || !/^\d{4}$/.test(pin)) {
      return errorResponse('Code invalide (4 chiffres requis)', 'invalid pin format', 400)
    }

    const Employee = mongoose.model<EmployeeDocument>('Employee')
    const matchedEmployee = await Employee.findOne({
      isActive: true,
      clockingCode: pin,
    }).lean()

    if (!matchedEmployee) {
      return errorResponse('Code de pointage incorrect', 'pin not matched', 401)
    }

    const senderName = `${matchedEmployee.firstName} ${matchedEmployee.lastName}`
    const senderEmployeeId = matchedEmployee._id.toString()

    const note = await StaffNote.create({
      destination,
      content: content.trim(),
      senderEmployeeId,
      senderName,
      isRead: false,
    })

    const formatted: StaffNoteType = {
      id: note._id.toString(),
      destination: note.destination,
      content: note.content,
      senderEmployeeId: note.senderEmployeeId,
      senderName: note.senderName,
      isRead: note.isRead,
      createdAt: note.createdAt.toISOString(),
    }

    return successResponse(formatted, 'Message envoyé avec succès', 201)
  } catch (error) {
    return errorResponse(
      'Erreur serveur',
      error instanceof Error ? error.message : 'Erreur inconnue'
    )
  }
}
