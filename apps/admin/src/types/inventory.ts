// ============================================================================
// Inventory Management Types
// ============================================================================

// ----------------------------------------------------------------------------
// Supplier (Fournisseur)
// ----------------------------------------------------------------------------

export interface Supplier {
  _id: string
  name: string
  contact: string
  email: string
  phone?: string
  categories: ("food" | "cleaning" | "emballage" | "papeterie" | "divers")[]
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SupplierFormData {
  name: string
  contact: string
  email: string
  phone?: string
  categories: ("food" | "cleaning" | "emballage" | "papeterie" | "divers")[]
  notes?: string
  isActive?: boolean
}

// ----------------------------------------------------------------------------
// Product (Produit)
// ----------------------------------------------------------------------------

export type ProductCategory = "food" | "cleaning"
export type ProductUnit = "kg" | "L" | "unit" | "pack"

export interface Product {
  _id: string
  name: string
  category: ProductCategory
  unit: ProductUnit
  unitPriceHT: number
  vatRate: number
  supplierId: string
  supplierName?: string
  minStock: number
  maxStock: number
  currentStock: number
  hasShortDLC: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  name: string
  category: ProductCategory
  unit: ProductUnit
  unitPriceHT: number
  vatRate: number
  supplierId: string
  minStock: number
  maxStock: number
  hasShortDLC: boolean
}

// ----------------------------------------------------------------------------
// Inventory Entry (Inventaire)
// ----------------------------------------------------------------------------

export type InventoryType = "monthly" | "weekly"

export interface InventoryEntryItem {
  productId: string
  productName: string
  theoreticalQty: number
  actualQty: number
  variance: number
  varianceValue: number
  unitPriceHT: number
}

export interface InventoryEntry {
  _id: string
  date: string
  type: InventoryType
  items: InventoryEntryItem[]
  totalVarianceValue: number
  createdBy?: string
  staffPinUsed?: string
  staffName?: string
  taskId?: string
  status: "draft" | "finalized"
  finalizedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateInventoryEntryData {
  type: InventoryType
  date: string
}

export interface UpdateInventoryItemData {
  productId: string
  actualQuantity: number
}

export interface UpdateInventoryItemsData {
  items: UpdateInventoryItemData[]
}

// ----------------------------------------------------------------------------
// Stock Movement (Mouvement)
// ----------------------------------------------------------------------------

export type MovementType = "inventory_adjustment" | "purchase_reception" | "manual"

export interface StockMovement {
  _id: string
  productId: string
  productName?: string
  type: MovementType
  quantity: number
  date: string
  reference?: string
  notes?: string
  createdBy: string
  createdAt: string
}

// ----------------------------------------------------------------------------
// Purchase Order (Commande)
// ----------------------------------------------------------------------------

export type OrderStatus = "draft" | "validated" | "sent" | "received"

export interface PurchaseOrderItem {
  productId: string
  productName: string
  quantity: number
  unit: string
  unitPriceHT: number
  totalHT: number
  vatRate: number
  totalTTC: number
}

export interface PurchaseOrder {
  _id: string
  orderNumber: string
  supplierId: string
  supplierName: string
  items: PurchaseOrderItem[]
  status: OrderStatus
  totalHT: number
  totalTTC: number
  createdBy?: string
  validatedBy?: string
  validatedAt?: string
  sentAt?: string
  receivedAt?: string
  receivedBy?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePurchaseOrderItemData {
  productId: string
  quantity: number
}

export interface CreatePurchaseOrderData {
  supplierId: string
  items: CreatePurchaseOrderItemData[]
  notes?: string
}

export interface UpdatePurchaseOrderData {
  items?: CreatePurchaseOrderItemData[]
  notes?: string
}

export interface ReceiveOrderItemData {
  productId: string
  receivedQty: number
}

export interface ReceiveOrderData {
  items: ReceiveOrderItemData[]
  notes?: string
}

export interface OrderSuggestion {
  productId: string
  productName: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  suggestedQuantity: number
  unitPriceHT: number
  vatRate: number
}

export interface OrderSuggestionsResponse {
  supplierId: string
  suggestions: OrderSuggestion[]
  total: number
}

// ----------------------------------------------------------------------------
// API Responses
// ----------------------------------------------------------------------------

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}

// ----------------------------------------------------------------------------
// Analytics Types
// ----------------------------------------------------------------------------

export interface StockValueBreakdown {
  category: string
  value: number
  products: number
}

export interface SupplierStockValue {
  supplierId: string
  supplierName: string
  value: number
}

export interface StockValueResponse {
  totalValue: number
  breakdown: StockValueBreakdown[]
  bySupplier: SupplierStockValue[]
}

export type CARatioStatus = "good" | "warning" | "critical"

export interface CARatioResponse {
  ca: number
  stockValue: number
  ratio: number
  rotationRate: number
  status: CARatioStatus
}

export type ConsumptionTrendDirection = "up" | "down" | "stable"

export interface ConsumptionDataPoint {
  date: string
  consumed: number
  value: number
}

export interface ConsumptionTrendItem {
  productId: string
  productName: string
  data: ConsumptionDataPoint[]
  trend: ConsumptionTrendDirection
  avgMonthly: number
}

export interface TopConsumedProduct {
  productId: string
  productName: string
  totalConsumed: number
  totalValue: number
}

export interface ConsumptionTrendsResponse {
  trends: ConsumptionTrendItem[]
  topConsumed: TopConsumedProduct[]
}

export interface SupplierPerformanceItem {
  supplierId: string
  supplierName: string
  totalProducts: number
  stockValue: number
  categories: string[]
}

export interface SupplierPerformanceResponse {
  suppliers: SupplierPerformanceItem[]
}

// ----------------------------------------------------------------------------
// Inventory Tasks Integration
// ----------------------------------------------------------------------------

export interface InventoryTaskSetupResult {
  weeklyTemplateId: string
  monthlyTemplateId: string
  created: number
  existing: number
}

export interface InventoryPendingTask {
  id: string
  title: string
  description?: string
  priority: "high" | "medium" | "low"
  dueDate?: string
  inventoryType: InventoryType
  recurringTaskId?: string
  createdAt: string
}

export interface LowStockAlertResult {
  tasksCreated: number
  products: Array<{
    productId: string
    productName: string
    currentStock: number
    minStock: number
  }>
}
