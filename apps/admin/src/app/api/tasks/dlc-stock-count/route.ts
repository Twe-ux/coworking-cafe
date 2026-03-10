import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Task } from '@coworking-cafe/database'
import { Product } from '@/models/inventory/product'
import { PurchaseOrder } from '@/models/inventory/purchaseOrder'
import { Supplier } from '@/models/inventory/supplier'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { sendNewPurchaseOrderNotification } from '@/lib/push-notifications'

export const dynamic = 'force-dynamic'

interface StockCountItem {
  productId: string
  countedStock: number
  orderSuggestion: number
}

interface RequestBody {
  taskId: string
  products: StockCountItem[]
}

/**
 * POST /api/tasks/dlc-stock-count - Submit DLC stock count
 *
 * SECURITY NOTE:
 * This endpoint is accessible without NextAuth session to allow staff access.
 * Staff are protected by IP verification in middleware.
 *
 * Receives stock counts from staff, creates order if needed,
 * creates admin notification, and marks task as completed.
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[DLC Stock Count] 1. Starting...')
    await connectMongoose()

    const body = (await request.json()) as RequestBody
    console.log('[DLC Stock Count] 2. Body received:', { taskId: body.taskId, productsCount: body.products.length })

    if (!body.taskId || !body.products || body.products.length === 0) {
      return errorResponse('Task ID and products required', undefined, 400)
    }

    // Try to get user info from session (for admin/dev)
    // If no session, use system user ID (for staff without NextAuth)
    const session = await getServerSession(authOptions)
    const systemUserId = process.env.SYSTEM_USER_ID || '000000000000000000000000'
    const userId = session?.user?.id || systemUserId
    const userName = session?.user?.name || 'Staff'
    console.log('[DLC Stock Count] 3. User info:', { userId, userName })

    // Validate task exists
    const task = await Task.findById(body.taskId)
    if (!task) {
      return errorResponse('Task not found', undefined, 404)
    }
    console.log('[DLC Stock Count] 4. Task found')

    // Fetch product details
    const productIds = body.products.map((p) => p.productId)
    const products = await Product.find({ _id: { $in: productIds } }).lean()
    console.log('[DLC Stock Count] 5. Products fetched:', products.length)

    // Build stock counts data
    const stockCounts = body.products.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId)
      return {
        productId: item.productId,
        productName: product?.name || 'Unknown',
        countedStock: item.countedStock,
        orderSuggestion: item.orderSuggestion,
        packageUnit: product?.packageUnit || 'unités',
      }
    })

    // Create draft purchase order if any products need restocking
    const productsNeedingOrder = body.products.filter(
      (p) => p.orderSuggestion > 0
    )
    console.log('[DLC Stock Count] 6. Products needing order:', productsNeedingOrder.length)

    let orderId = null
    if (productsNeedingOrder.length > 0) {
      console.log('[DLC Stock Count] 7. Creating purchase order...')
      // Get supplier info
      const firstProduct = products.find(
        (p) => p._id.toString() === productsNeedingOrder[0].productId
      )
      const supplier = firstProduct?.supplierId
        ? await Supplier.findById(firstProduct.supplierId).lean()
        : null

      // Generate order number (format: PO-YYYYMMDD-XXX)
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
      const lastOrder = await PurchaseOrder.findOne({
        orderNumber: { $regex: `^PO-${dateStr}` },
      })
        .sort({ orderNumber: -1 })
        .lean()
      const lastNum = lastOrder
        ? parseInt(lastOrder.orderNumber.split('-')[2] || '0')
        : 0
      const orderNumber = `PO-${dateStr}-${String(lastNum + 1).padStart(3, '0')}`

      const orderItems = productsNeedingOrder.map((item) => {
        const product = products.find(
          (p) => p._id.toString() === item.productId
        )
        const unitPriceHT = product?.unitPriceHT || 0
        const packagingType = product?.packagingType || 'unit'
        const unitsPerPackage = product?.unitsPerPackage || 1

        // Convert orderSuggestion (in units) to packs if needed
        const quantityInPacks = packagingType === 'pack' && unitsPerPackage > 1
          ? Math.ceil(item.orderSuggestion / unitsPerPackage)
          : item.orderSuggestion

        // Calculate price per item (pack or unit)
        const pricePerItem = packagingType === 'pack' && unitsPerPackage > 1
          ? unitPriceHT * unitsPerPackage
          : unitPriceHT

        const totalHT = pricePerItem * quantityInPacks
        const vatRate = product?.vatRate || 5.5
        const totalTTC = totalHT * (1 + vatRate / 100)

        return {
          productId: item.productId,
          productName: product?.name || 'Unknown',
          quantity: quantityInPacks,
          packagingType,
          unitPriceHT,
          totalHT,
          vatRate,
          totalTTC,
          unitsPerPackage,
        }
      })

      const totalHT = orderItems.reduce((sum, item) => sum + item.totalHT, 0)
      const totalTTC = orderItems.reduce((sum, item) => sum + item.totalTTC, 0)

      const order = await PurchaseOrder.create({
        orderNumber,
        supplierId: supplier?._id || products[0]?.supplierId,
        supplierName: supplier?.name || 'Fournisseur inconnu',
        items: orderItems,
        status: 'draft',
        totalHT,
        totalTTC,
        createdBy: userId,
        notes: `Commande DLC générée automatiquement par ${userName}\n\nRéférence tâche: ${body.taskId}`,
      })

      orderId = order._id.toString()
      console.log('[DLC Stock Count] 8. Purchase order created:', orderId)

      // Compter les commandes en brouillon pour le badge
      const draftCount = await PurchaseOrder.countDocuments({ status: 'draft' })

      // Envoyer notification push
      try {
        await sendNewPurchaseOrderNotification({
          id: orderId,
          orderNumber,
          supplierName: supplier?.name || 'Fournisseur inconnu',
          itemsCount: orderItems.length,
          draftCount,
        })
        console.log('[DLC Stock Count] Push notification sent for order:', orderId)
      } catch (notifError) {
        // Ne pas bloquer si la notification échoue
        console.error('[DLC Stock Count] Failed to send push notification:', notifError)
      }
    }

    console.log('[DLC Stock Count] 9. Marking task as completed...')
    // Mark original task as completed
    task.status = 'completed'
    task.completedAt = new Date()
    task.metadata = {
      ...((task.metadata || {}) as Record<string, unknown>),
      stockCounts,
      orderId,
      completedBy: userId,
    }
    task.markModified('metadata')
    await task.save()

    return successResponse(
      {
        taskCompleted: true,
        orderCreated: !!orderId,
        orderId,
        stockCounts,
      },
      'Stock count submitted successfully'
    )
  } catch (error) {
    console.error('[POST /api/tasks/dlc-stock-count] Error:', error)
    return errorResponse(
      'Error submitting stock count',
      error instanceof Error ? error.message : undefined,
      500
    )
  }
}
