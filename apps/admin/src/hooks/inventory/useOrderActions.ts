import { useState } from 'react'
import type {
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
  ReceiveOrderData,
  APIResponse,
  PurchaseOrder,
} from '@/types/inventory'

interface UseOrderActionsReturn {
  creating: boolean
  updating: boolean
  validating: boolean
  sending: boolean
  receiving: boolean
  createOrder: (data: CreatePurchaseOrderData) => Promise<{ success: boolean; orderId?: string; error?: string }>
  updateOrder: (id: string, data: UpdatePurchaseOrderData) => Promise<boolean>
  validateOrder: (id: string) => Promise<boolean>
  sendOrder: (id: string) => Promise<boolean>
  receiveOrder: (id: string, data: ReceiveOrderData) => Promise<boolean>
  deleteOrder: (id: string) => Promise<boolean>
}

export function useOrderActions(): UseOrderActionsReturn {
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [validating, setValidating] = useState(false)
  const [sending, setSending] = useState(false)
  const [receiving, setReceiving] = useState(false)

  const createOrder = async (
    data: CreatePurchaseOrderData
  ): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    setCreating(true)
    try {
      const res = await fetch('/api/inventory/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = (await res.json()) as APIResponse<PurchaseOrder>

      if (result.success && result.data) {
        return { success: true, orderId: result.data._id }
      } else {
        return { success: false, error: result.error }
      }
    } catch (err) {
      console.error('[useOrderActions] Create error:', err)
      return { success: false, error: 'Erreur réseau' }
    } finally {
      setCreating(false)
    }
  }

  const updateOrder = async (
    id: string,
    data: UpdatePurchaseOrderData
  ): Promise<boolean> => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/inventory/purchase-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = (await res.json()) as APIResponse<PurchaseOrder>
      return result.success
    } catch (err) {
      console.error('[useOrderActions] Update error:', err)
      return false
    } finally {
      setUpdating(false)
    }
  }

  const validateOrder = async (id: string): Promise<boolean> => {
    setValidating(true)
    try {
      const res = await fetch(
        `/api/inventory/purchase-orders/${id}/validate`,
        { method: 'POST' }
      )
      const result = (await res.json()) as APIResponse<PurchaseOrder>
      return result.success
    } catch (err) {
      console.error('[useOrderActions] Validate error:', err)
      return false
    } finally {
      setValidating(false)
    }
  }

  const sendOrder = async (id: string): Promise<boolean> => {
    setSending(true)
    try {
      const res = await fetch(
        `/api/inventory/purchase-orders/${id}/send-email`,
        { method: 'POST' }
      )
      const result = (await res.json()) as APIResponse<PurchaseOrder>
      return result.success
    } catch (err) {
      console.error('[useOrderActions] Send error:', err)
      return false
    } finally {
      setSending(false)
    }
  }

  const receiveOrder = async (
    id: string,
    data: ReceiveOrderData
  ): Promise<boolean> => {
    setReceiving(true)
    try {
      const res = await fetch(
        `/api/inventory/purchase-orders/${id}/receive`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )
      const result = (await res.json()) as APIResponse<PurchaseOrder>
      return result.success
    } catch (err) {
      console.error('[useOrderActions] Receive error:', err)
      return false
    } finally {
      setReceiving(false)
    }
  }

  const deleteOrder = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/purchase-orders/${id}`, {
        method: 'DELETE',
      })
      const result = (await res.json()) as APIResponse<{ deleted: boolean }>
      return result.success
    } catch (err) {
      console.error('[useOrderActions] Delete error:', err)
      return false
    }
  }

  return {
    creating,
    updating,
    validating,
    sending,
    receiving,
    createOrder,
    updateOrder,
    validateOrder,
    sendOrder,
    receiveOrder,
    deleteOrder,
  }
}
