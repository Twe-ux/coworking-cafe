import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { connectDB } from '@/lib/db'
import { SpaceConfiguration } from '@coworking-cafe/database'
import { successResponse, errorResponse } from '@/lib/api/response'
import type { SpaceConfiguration as SpaceConfigurationType } from '@/types/booking'

/**
 * GET /api/booking/spaces
 * List all space configurations
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(['dev', 'admin', 'staff'])
    if (!authResult.authorized) return authResult.response

    await connectDB()

    const spaces = await SpaceConfiguration.find({ isDeleted: false }).sort({ displayOrder: 1 })

    const data: SpaceConfigurationType[] = spaces.map(space => ({
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
    }))

    return successResponse(data)
  } catch (error) {
    console.error('GET /api/booking/spaces error:', error)
    return errorResponse('Failed to fetch space configurations', undefined, 500)
  }
}

/**
 * POST /api/booking/spaces
 * Create a new space configuration
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(['dev', 'admin'])
    if (!authResult.authorized) return authResult.response

    const body = await request.json()

    if (!body.spaceType || !body.name) {
      return errorResponse('spaceType and name are required', undefined, 400)
    }

    await connectDB()

    const existing = await SpaceConfiguration.findOne({ spaceType: body.spaceType })
    if (existing) {
      return errorResponse(`Space type ${body.spaceType} already exists`, undefined, 409)
    }

    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-')

    const space = await SpaceConfiguration.create({
      ...body,
      slug,
      isDeleted: false,
    })

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

    return successResponse(data, undefined, 201)
  } catch (error) {
    console.error('POST /api/booking/spaces error:', error)
    return errorResponse('Failed to create space configuration', undefined, 500)
  }
}
