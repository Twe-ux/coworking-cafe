import { InventoryEntry } from '@/models/inventory/inventoryEntry'
import { StockMovement } from '@/models/inventory/stockMovement'

interface CUMPResult {
  cump: number
  initialQty: number
  initialValue: number
  receiptsQty: number
  receiptsValue: number
  totalQty: number
  totalValue: number
}

/**
 * Calculate the Weighted Average Unit Cost (CUMP) for a product over a period
 *
 * Formula: CUMP = (Initial Stock Value + Receipts Value) / (Initial Stock Qty + Receipts Qty)
 *
 * @param productId - Product ID
 * @param startDate - Start of period (YYYY-MM-DD)
 * @param endDate - End of period (YYYY-MM-DD)
 * @returns CUMP and detailed breakdown
 */
export async function calculateCUMP(
  productId: string,
  startDate: string,
  endDate: string
): Promise<CUMPResult> {
  // 1. Get initial stock (last finalized inventory before period)
  const previousInventory = await InventoryEntry.findOne({
    date: { $lt: new Date(startDate) },
    status: 'finalized',
  })
    .sort({ date: -1 })
    .lean()

  const initialItem = previousInventory?.items?.find(
    (item: { productId: string }) => item.productId.toString() === productId
  )

  const initialQty = initialItem?.actualQty || 0
  const initialValue = initialQty * (initialItem?.unitPriceHT || 0)

  // 2. Get all receipts during the period (purchase receptions)
  const receipts = await StockMovement.find({
    productId,
    type: 'purchase_reception',
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  }).lean()

  const receiptsQty = receipts.reduce((sum, r) => sum + r.quantity, 0)
  const receiptsValue = receipts.reduce((sum, r) => sum + r.totalValue, 0)

  // 3. Calculate CUMP
  const totalQty = initialQty + receiptsQty
  const totalValue = initialValue + receiptsValue
  const cump = totalQty > 0 ? totalValue / totalQty : initialItem?.unitPriceHT || 0

  return {
    cump,
    initialQty,
    initialValue,
    receiptsQty,
    receiptsValue,
    totalQty,
    totalValue,
  }
}

/**
 * Calculate CUMP for multiple products at once
 */
export async function calculateCUMPBatch(
  productIds: string[],
  startDate: string,
  endDate: string
): Promise<Map<string, CUMPResult>> {
  const results = new Map<string, CUMPResult>()

  await Promise.all(
    productIds.map(async (productId) => {
      const result = await calculateCUMP(productId, startDate, endDate)
      results.set(productId, result)
    })
  )

  return results
}
