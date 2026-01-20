import { ApiResponse } from '../types'

export interface FetchOptions extends RequestInit {
  token?: string
}

export async function apiFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { token, headers, ...restOptions } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        requestHeaders[key] = value
      }
    })
  }

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Request failed',
      }
    }

    return {
      success: true,
      data: data.data || data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function get<T>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, { ...options, method: 'GET' })
}

export async function post<T>(
  url: string,
  body?: any,
  options?: FetchOptions
): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function put<T>(
  url: string,
  body?: any,
  options?: FetchOptions
): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function del<T>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, { ...options, method: 'DELETE' })
}
