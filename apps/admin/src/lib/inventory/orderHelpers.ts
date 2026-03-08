/**
 * Transform a PurchaseOrder document (lean or toObject) to API response format.
 * Converts ObjectId fields to strings and dates to YYYY-MM-DD strings.
 */
export function transformOrder(order: Record<string, unknown>) {
  const doc = order as {
    _id?: { toString: () => string }
    supplierId?: { toString: () => string }
    items?: Array<{
      productId?: { toString: () => string }
      [key: string]: unknown
    }>
    validatedAt?: Date | string
    sentAt?: Date | string
    receivedAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    [key: string]: unknown
  }

  const formatDate = (d: Date | string | undefined): string | undefined => {
    if (!d) return undefined
    if (typeof d === 'string') return d.split('T')[0]
    return d.toISOString().split('T')[0]
  }

  const items = (doc.items || []).map((item) => ({
    ...item,
    productId: item.productId?.toString() || '',
  }))

  return {
    ...order,
    _id: doc._id?.toString() || '',
    supplierId: doc.supplierId?.toString() || '',
    items,
    validatedAt: formatDate(doc.validatedAt),
    sentAt: formatDate(doc.sentAt),
    receivedAt: formatDate(doc.receivedAt),
    createdAt: formatDate(doc.createdAt) || '',
    updatedAt: formatDate(doc.updatedAt) || '',
  }
}
