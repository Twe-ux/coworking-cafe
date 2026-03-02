/**
 * Transform product document to API response format
 * Handles populated supplier field and date formatting
 */
export function transformProductForAPI(product: {
  [key: string]: unknown
}) {
  const prod = product as unknown as {
    _id: { toString: () => string }
    supplierId?: { _id?: { toString: () => string }; name?: string } | string
    supplierName?: string
    createdAt?: Date
    updatedAt?: Date
  }

  const supplierId =
    prod.supplierId && typeof prod.supplierId === 'object' && prod.supplierId._id
      ? prod.supplierId._id.toString()
      : prod.supplierId

  const supplierName =
    prod.supplierId && typeof prod.supplierId === 'object'
      ? prod.supplierId.name
      : prod.supplierName

  return {
    ...product,
    _id: prod._id.toString(),
    supplierId,
    supplierName,
    createdAt: prod.createdAt?.toISOString().split('T')[0] || '',
    updatedAt: prod.updatedAt?.toISOString().split('T')[0] || '',
  }
}
