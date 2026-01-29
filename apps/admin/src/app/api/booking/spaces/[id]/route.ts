import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { connectDB } from '@/lib/db'
import { SpaceConfiguration } from '@coworking-cafe/database'
import { successResponse, errorResponse } from '@/lib/api/response'
import type { SpaceConfiguration as SpaceConfigurationType } from '@/types/booking'

/**
 * GET /api/booking/spaces/[id]
 * Get a specific space configuration
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(['dev', 'admin', 'staff'])
    if (!authResult.authorized) return authResult.response

    await connectDB()

    const space = await SpaceConfiguration.findOne({
      $or: [{ _id: params.id }, { spaceType: params.id }],
      isDeleted: false,
    })

    if (!space) {
      return errorResponse('Space configuration not found', undefined, 404)
    }

    const data: SpaceConfigurationType = {
      _id: space._id.toString(),
      spaceType: space.spaceType,
      name: space.name,
      slug: space.slug,
      description: space.description,
      pricing: space.pricing,
      availableReservationTypes: space.availableReservationTypes,
      requiresQuote: space.requiresQuote,
      depositPolicy: space.depositPolicy,
      minCapacity: space.minCapacity,
      maxCapacity: space.maxCapacity,
      isActive: space.isActive,
      imageUrl: space.imageUrl,
      displayOrder: space.displayOrder,
      features: space.features || [],
      createdAt: space.createdAt.toISOString(),
      updatedAt: space.updatedAt.toISOString(),
      isDeleted: space.isDeleted,
    }

    return successResponse(data)
  } catch (error) {
    console.error('GET /api/booking/spaces/[id] error:', error)
    return errorResponse('Failed to fetch space configuration', undefined, 500)
  }
}

/**
 * PUT /api/booking/spaces/[id]
 * Update a space configuration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(['dev', 'admin'])
    if (!authResult.authorized) return authResult.response

    const body = await request.json()

    await connectDB()

    const space = await SpaceConfiguration.findOne({
      $or: [{ _id: params.id }, { spaceType: params.id }],
      isDeleted: false,
    })

    if (!space) {
      return errorResponse('Space configuration not found', undefined, 404)
    }

    // Update fields
    Object.assign(space, body)
    await space.save()

    const data: SpaceConfigurationType = {
      _id: space._id.toString(),
      spaceType: space.spaceType,
      name: space.name,
      slug: space.slug,
      description: space.description,
      pricing: space.pricing,
      availableReservationTypes: space.availableReservationTypes,
      requiresQuote: space.requiresQuote,
      depositPolicy: space.depositPolicy,
      minCapacity: space.minCapacity,
      maxCapacity: space.maxCapacity,
      isActive: space.isActive,
      imageUrl: space.imageUrl,
      displayOrder: space.displayOrder,
      features: space.features || [],
      createdAt: space.createdAt.toISOString(),
      updatedAt: space.updatedAt.toISOString(),
      isDeleted: space.isDeleted,
    }

    return successResponse(data)
  } catch (error) {
    console.error('PUT /api/booking/spaces/[id] error:', error)
    return errorResponse('Failed to update space configuration', undefined, 500)
  }
}

/**
 * DELETE /api/booking/spaces/[id]
 * Soft delete a space configuration
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(['dev', 'admin'])
    if (!authResult.authorized) return authResult.response

    await connectDB()

    const space = await SpaceConfiguration.findOne({
      $or: [{ _id: params.id }, { spaceType: params.id }],
      isDeleted: false,
    })

    if (!space) {
      return errorResponse('Space configuration not found', undefined, 404)
    }

    space.isDeleted = true
    space.isActive = false
    await space.save()

    return successResponse(undefined)
  } catch (error) {
    console.error('DELETE /api/booking/spaces/[id] error:', error)
    return errorResponse('Failed to delete space configuration', undefined, 500)
  }
}
