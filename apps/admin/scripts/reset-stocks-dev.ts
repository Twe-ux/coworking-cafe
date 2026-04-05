/**
 * Reset all product stocks to zero (DEV ONLY)
 *
 * ⚠️ DANGER: This script DELETES all stock movements and resets all product stocks to 0
 * ⚠️ NEVER run this in production!
 *
 * Usage:
 *   pnpm tsx scripts/reset-stocks-dev.ts
 */

import mongoose from 'mongoose';
import { Product } from '../src/models/inventory/product';
import { StockMovement } from '../src/models/inventory/stockMovement';
import { PurchaseOrder } from '../src/models/inventory/purchaseOrder';
import { InventoryEntry } from '../src/models/inventory/inventoryEntry';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Safety check: prevent running in production
if (process.env.NODE_ENV === 'production' || MONGODB_URI.includes('prod')) {
  console.error('❌ SAFETY CHECK FAILED: This script cannot run in production!');
  console.error('❌ Detected production environment or production database URL');
  process.exit(1);
}

async function resetStocks() {
  try {
    console.log('🚀 Reset Stocks Script - DEV ONLY');
    console.log('');
    console.log('⚠️  DANGER: This will DELETE all stock data and reset to zero!');
    console.log('');
    console.log('This script will:');
    console.log('  1. Delete all StockMovements');
    console.log('  2. Delete all InventoryEntries');
    console.log('  3. Reset all Product.currentStock to 0');
    console.log('  4. Keep PurchaseOrders (for reference)');
    console.log('');
    console.log('⚠️  Waiting 5 seconds... Press Ctrl+C to cancel!');
    console.log('');

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('');

    // 1. Delete all stock movements
    console.log('🗑️  Deleting all StockMovements...');
    const deletedMovements = await StockMovement.deleteMany({});
    console.log(`✅ Deleted ${deletedMovements.deletedCount} stock movements`);
    console.log('');

    // 2. Delete all inventory entries
    console.log('🗑️  Deleting all InventoryEntries...');
    const deletedEntries = await InventoryEntry.deleteMany({});
    console.log(`✅ Deleted ${deletedEntries.deletedCount} inventory entries`);
    console.log('');

    // 3. Reset all product stocks to 0
    console.log('🔄 Resetting all Product.currentStock to 0...');
    const products = await Product.find({ isActive: true });
    let updatedCount = 0;

    for (const product of products) {
      if (product.currentStock !== 0) {
        product.currentStock = 0;
        await product.save();
        updatedCount++;
        console.log(`  ✅ ${product.name}: ${product.currentStock} → 0`);
      }
    }

    console.log('');
    console.log(`✅ Reset ${updatedCount} products to stock 0`);
    console.log(`ℹ️  ${products.length - updatedCount} products already at 0`);
    console.log('');

    // 4. Show purchase orders count (kept for reference)
    const ordersCount = await PurchaseOrder.countDocuments();
    console.log(`ℹ️  Keeping ${ordersCount} purchase orders for reference`);
    console.log('');

    console.log('✨ Stock reset completed successfully!');
    console.log('');
    console.log('📊 Current state:');
    console.log(`  - Products: ${products.length} (all at stock 0)`);
    console.log(`  - StockMovements: 0`);
    console.log(`  - InventoryEntries: 0`);
    console.log(`  - PurchaseOrders: ${ordersCount} (kept)`);
    console.log('');
    console.log('🎯 Next steps:');
    console.log('  1. Create an inventory entry');
    console.log('  2. Enter real stock counts');
    console.log('  3. Finalize inventory');
    console.log('  4. Verify stock movements are created correctly');
    console.log('  5. Test order creation');
    console.log('');

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run
resetStocks();
