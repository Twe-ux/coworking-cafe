import { NextResponse } from 'next/server'

export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status })
}

export function errorResponse(error: string, details?: any, status = 500) {
  return NextResponse.json({ success: false, error, details }, { status })
}

export function notFoundResponse(resource: string) {
  return NextResponse.json(
    { success: false, error: `${resource} non trouvé` },
    { status: 404 }
  )
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: 'Non authentifié' },
    { status: 401 }
  )
}

export function forbiddenResponse() {
  return NextResponse.json(
    { success: false, error: 'Permissions insuffisantes' },
    { status: 403 }
  )
}
