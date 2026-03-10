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
  order: number
  isActive: boolean
  dlcAlertConfig?: DLCAlertConfig
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
  dlcAlertConfig?: DLCAlertConfig
}

// ----------------------------------------------------------------------------
// Product (Produit)
// ----------------------------------------------------------------------------

export type ProductCategory = "food" | "cleaning" | "emballage" | "papeterie" | "divers"
export type ProductUnit = "kg" | "L" | "unit" | "pack"
export type PackagingType = "pack" | "unit"
export type PackageUnit = "kg" | "L" | "unit"
export type PriceType = "unit" | "pack"
export type MinStockUnit = "package" | "unit"

export interface DLCAlertConfig {
  enabled: boolean
  days: number[] // 0=Dimanche, 1=Lundi, ..., 6=Samedi
  time: string // Format "HH:mm"
}

export interface Product {
  _id: string
  name: string
  category: ProductCategory
  unitPriceHT: number
  vatRate: number
  supplierId: string
  supplierName?: string
  supplierReference?: string
  packagingType: PackagingType
  priceType: PriceType
  unitsPerPackage: number
  packageUnit?: PackageUnit
  packagingDescription?: string
  minStock: number
  maxStock: number
  currentStock: number
  hasShortDLC: boolean
  dlcAlertConfig?: DLCAlertConfig
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  name: string
  category: ProductCategory
  unitPriceHT: number
  vatRate: number
  supplierId: string
  supplierReference?: string
  packagingType: PackagingType
  priceType: PriceType
  unitsPerPackage: number
  packageUnit?: PackageUnit
  packagingDescription?: string
  minStock: number
  maxStock: number
  dlcAlertConfig?: DLCAlertConfig
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
  title?: string
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
  title?: string
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

export type MovementType = "inventory_adjustment" | "purchase_reception" | "manual" | "loss" | "direct_purchase"

export interface StockMovement {
  _id: string
  productId: string
  productName?: string
  type: MovementType
  quantity: number
  unitPriceHT: number
  totalValue: number
  date: string
  reference?: string
  notes?: string
  createdBy: string
  createdAt: string
}

// ----------------------------------------------------------------------------
// Product Loss (Perte)
// ----------------------------------------------------------------------------

export type LossReason = "expiration" | "damage" | "theft" | "error" | "other"

export interface ProductLoss {
  _id: string
  productId: string
  productName: string
  quantity: number
  reason: LossReason
  notes?: string
  unitPriceHT: number
  totalValue: number
  date: string
  createdBy: string
  createdAt: string
}

export interface CreateProductLossData {
  quantity: number
  reason: LossReason
  notes?: string
  date: string
}

// ----------------------------------------------------------------------------
// Purchase Order (Commande)
// ----------------------------------------------------------------------------

export type OrderStatus = "draft" | "validated" | "sent" | "received"

export interface PurchaseOrderItem {
  productId: string
  productName: string
  quantity: number
  packagingType: PackagingType
  unitPriceHT: number
  totalHT: number
  vatRate: number
  totalTTC: number
  unitsPerPackage?: number
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
  currentStock: number
  currentStockFormatted: string
  minStock: number
  maxStock: number
  suggestedQuantity: number
  suggestedUnits: number
  packagingType: PackagingType
  packagingDescription?: string
  supplierReference?: string
  unitPriceHT: number
  vatRate: number
}

export interface OrderSuggestionsResponse {
  supplierId: string
  suggestions: OrderSuggestion[]
  total: number
}

// ----------------------------------------------------------------------------
// Direct Purchase (Achat Direct)
// ----------------------------------------------------------------------------

export interface DirectPurchaseItem {
  productId: string
  productName: string
  quantity: number
  packagingType: PackagingType
  unitPriceHT: number
  totalHT: number
  vatRate: number
  totalTTC: number
  unitsPerPackage?: number
}

export interface DirectPurchase {
  _id: string
  purchaseNumber: string
  supplier: string
  items: DirectPurchaseItem[]
  totalHT: number
  totalTTC: number
  date: string
  invoiceNumber?: string
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateDirectPurchaseItemData {
  productId: string
  quantity: number
  unitPriceHT: number
}

export interface CreateDirectPurchaseData {
  supplier: string
  items: CreateDirectPurchaseItemData[]
  date: string
  invoiceNumber?: string
  notes?: string
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
