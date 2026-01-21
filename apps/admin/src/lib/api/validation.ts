import { NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'
import type { ApiResponse } from '@/types/timeEntry'

/**
 * Validate request body against Zod schema
 * Returns validated data or error response
 *
 * @param body - Request body to validate
 * @param schema - Zod schema to validate against
 * @returns Validation result with data or error response
 */
export function validateRequest<T>(
  body: unknown,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse<ApiResponse<null>> } {
  try {
    const validatedData = schema.parse(body)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((err) =>
        `${err.path.join('.')}: ${err.message}`
      )

      return {
        success: false,
        response: NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: 'Données invalides',
            details: errorMessages,
          },
          { status: 400 }
        ),
      }
    }

    return {
      success: false,
      response: NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Erreur de validation',
          details: error instanceof Error ? error.message : 'Erreur inconnue',
        },
        { status: 400 }
      ),
    }
  }
}

/**
 * Parse and validate request body in one step
 * For use in API route handlers
 *
 * @param request - NextRequest object
 * @param schema - Zod schema to validate against
 * @returns Validated data or throws with error response
 */
export async function parseAndValidate<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse<ApiResponse<null>> }> {
  try {
    const body = await request.json()
    return validateRequest(body, schema)
  } catch (error) {
    return {
      success: false,
      response: NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Corps de requête invalide',
          details: 'Le corps de la requête doit être au format JSON valide',
        },
        { status: 400 }
      ),
    }
  }
}
