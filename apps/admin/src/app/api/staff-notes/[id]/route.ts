import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import { StaffNote } from '@/models/staffNote'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/staff-notes/[id]
 * Marks a staff note as read (staff inbox dismiss)
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  await connectMongoose()

  const note = await StaffNote.findById(params.id)
  if (!note) return errorResponse('Note introuvable', 'not found', 404)

  const now = new Date()
  const readAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  note.isRead = true
  note.readAt = readAt
  await note.save()

  return successResponse({ id: params.id, isRead: true })
}

/**
 * DELETE /api/staff-notes/[id]
 * Deletes a note — requires admin auth
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const authResult = await requireAuth(['dev', 'admin'])
  if (!authResult.authorized) return authResult.response

  await connectMongoose()

  const note = await StaffNote.findByIdAndDelete(params.id)
  if (!note) return errorResponse('Note introuvable', 'not found', 404)

  return successResponse({ id: params.id }, 'Note supprimée')
}
