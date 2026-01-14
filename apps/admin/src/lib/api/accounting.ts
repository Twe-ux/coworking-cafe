import type { CashEntry, Turnover } from "@/types/accounting"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
}

interface ApiError {
  error: string
  code?: string
  details?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: string
  count?: number
  message?: string
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    const error: ApiError = {
      error: data.error || "Erreur inconnue",
      code: data.code || "UNKNOWN_ERROR",
      details: data.details,
    }
    throw error
  }

  return data
}

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value))
    }
  })

  return searchParams.toString()
}

export const accountingApi = {
  cashEntries: {
    async list(params: {
      startDate?: string
      endDate?: string
    } = {}): Promise<CashEntry[]> {
      const queryString = buildQueryString(params)
      const url = `${API_BASE_URL}/api/accounting/cash-entries${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers: DEFAULT_HEADERS,
      })

      const result = await handleApiResponse<ApiResponse<CashEntry[]>>(response)
      return result.data || []
    },

    async getById(id: string): Promise<CashEntry> {
      const response = await fetch(
        `${API_BASE_URL}/api/accounting/cash-entries/${id}`,
        {
          method: "GET",
          headers: DEFAULT_HEADERS,
        }
      )

      const result = await handleApiResponse<ApiResponse<CashEntry>>(response)
      if (!result.data) {
        throw new Error("Cash entry not found")
      }
      return result.data
    },

    async create(data: Partial<CashEntry>): Promise<CashEntry> {
      const response = await fetch(`${API_BASE_URL}/api/accounting/cash-entries`, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
      })

      const result = await handleApiResponse<ApiResponse<CashEntry>>(response)
      if (!result.data) {
        throw new Error("Failed to create cash entry")
      }
      return result.data
    },

    async update(id: string, data: Partial<CashEntry>): Promise<CashEntry> {
      const response = await fetch(
        `${API_BASE_URL}/api/accounting/cash-entries/${id}`,
        {
          method: "PUT",
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(data),
        }
      )

      const result = await handleApiResponse<ApiResponse<CashEntry>>(response)
      if (!result.data) {
        throw new Error("Failed to update cash entry")
      }
      return result.data
    },

    async delete(id: string): Promise<void> {
      const response = await fetch(
        `${API_BASE_URL}/api/accounting/cash-entries/${id}`,
        {
          method: "DELETE",
          headers: DEFAULT_HEADERS,
        }
      )

      await handleApiResponse<ApiResponse<CashEntry>>(response)
    },
  },

  turnovers: {
    async list(params: {
      startDate?: string
      endDate?: string
    } = {}): Promise<Turnover[]> {
      const queryString = buildQueryString(params)
      const url = `${API_BASE_URL}/api/accounting/turnovers${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers: DEFAULT_HEADERS,
      })

      const result = await handleApiResponse<ApiResponse<Turnover[]>>(response)
      return result.data || []
    },

    async getById(id: string): Promise<Turnover> {
      const response = await fetch(
        `${API_BASE_URL}/api/accounting/turnovers/${id}`,
        {
          method: "GET",
          headers: DEFAULT_HEADERS,
        }
      )

      const result = await handleApiResponse<ApiResponse<Turnover>>(response)
      if (!result.data) {
        throw new Error("Turnover entry not found")
      }
      return result.data
    },

    async create(data: Partial<Turnover>): Promise<Turnover> {
      const response = await fetch(`${API_BASE_URL}/api/accounting/turnovers`, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
      })

      const result = await handleApiResponse<ApiResponse<Turnover>>(response)
      if (!result.data) {
        throw new Error("Failed to create turnover entry")
      }
      return result.data
    },

    async update(id: string, data: Partial<Turnover>): Promise<Turnover> {
      const response = await fetch(
        `${API_BASE_URL}/api/accounting/turnovers/${id}`,
        {
          method: "PUT",
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(data),
        }
      )

      const result = await handleApiResponse<ApiResponse<Turnover>>(response)
      if (!result.data) {
        throw new Error("Failed to update turnover entry")
      }
      return result.data
    },

    async delete(id: string): Promise<void> {
      const response = await fetch(
        `${API_BASE_URL}/api/accounting/turnovers/${id}`,
        {
          method: "DELETE",
          headers: DEFAULT_HEADERS,
        }
      )

      await handleApiResponse<ApiResponse<Turnover>>(response)
    },
  },
}
