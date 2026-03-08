import type { InventoryType, APIResponse, InventoryEntry } from '@/types/inventory'

interface CreateInventoryAutoOptions {
  type?: InventoryType
  taskId?: string
}

interface CreateInventoryAutoResult {
  success: true
  inventoryId: string
}

interface CreateInventoryAutoError {
  success: false
  error: string
}

type CreateInventoryAutoReturn = CreateInventoryAutoResult | CreateInventoryAutoError

/**
 * Create a draft inventory entry automatically with today's date.
 * Calls POST /api/inventory/entries and returns the created entry ID.
 */
export async function createInventoryAuto(
  options: CreateInventoryAutoOptions = {}
): Promise<CreateInventoryAutoReturn> {
  const { type = 'monthly', taskId } = options
  const today = new Date().toISOString().split('T')[0]

  try {
    const res = await fetch('/api/inventory/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, date: today, taskId }),
    })

    const data = (await res.json()) as APIResponse<InventoryEntry>

    if (data.success && data.data) {
      return { success: true, inventoryId: data.data._id }
    }

    // Handle duplicate draft (409)
    if (res.status === 409) {
      return {
        success: false,
        error: 'Un inventaire brouillon existe déjà pour aujourd\'hui',
      }
    }

    return {
      success: false,
      error: data.error || 'Erreur lors de la création de l\'inventaire',
    }
  } catch {
    return { success: false, error: 'Erreur réseau' }
  }
}
