#!/usr/bin/env node

/**
 * Batch Image Optimization Script
 * Optimizes all large images in public/images/
 * Target: All PNG/JPG > 100KB to WebP < 100KB
 */

import sharp from 'sharp';
import { readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_PUBLIC = join(__dirname, '../apps/site/public/images');
const MIN_SIZE = 100 * 1024; // 100KB threshold

/**
 * Format file size
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

/**
 * Get all image files recursively
 */
function getImageFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // Skip backup and _originals directories
      if (!file.startsWith('_') && file !== 'backup') {
        getImageFiles(filePath, fileList);
      }
    } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
      const size = stat.size;
      if (size > MIN_SIZE) {
        fileList.push({ path: filePath, size });
      }
    }
  });

  return fileList;
}

/**
 * Optimize single image
 */
async function optimizeImage(filePath, originalSize) {
  const ext = extname(filePath);
  const baseName = basename(filePath, ext);
  const dirName = dirname(filePath);
  const outputPath = join(dirName, `${baseName}.webp`);

  try {
    const metadata = await sharp(filePath).metadata();

    // Strategy: Keep original dimensions but compress to WebP
    await sharp(filePath)
      .webp({
        quality: 85,
        effort: 6,
      })
      .toFile(outputPath);

    const optimizedSize = statSync(outputPath).size;
    const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

    return {
      success: true,
      original: filePath,
      output: outputPath,
      originalSize,
      optimizedSize,
      reduction,
      dimensions: `${metadata.width}x${metadata.height}`,
    };
  } catch (error) {
    return {
      success: false,
      original: filePath,
      error: error.message,
    };
  }
}

/**
 * Main optimization process
 */
async function batchOptimize() {
  console.log('🖼️  Batch Image Optimization\n');
  console.log('📁 Scanning:', SITE_PUBLIC);
  console.log('🎯 Target: PNG/JPG > 100KB → WebP\n');

  const imageFiles = getImageFiles(SITE_PUBLIC);

  if (imageFiles.length === 0) {
    console.log('✅ No images found above 100KB threshold');
    return;
  }

  console.log(`📊 Found ${imageFiles.length} images to optimize:\n`);

  const results = [];
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (const file of imageFiles) {
    const relativePath = file.path.replace(SITE_PUBLIC, '');
    console.log(`\n📦 Processing: ${relativePath}`);
    console.log(`   Original: ${formatSize(file.size)}`);

    const result = await optimizeImage(file.path, file.size);

    if (result.success) {
      console.log(`   ✅ WebP: ${formatSize(result.optimizedSize)} (-${result.reduction}%)`);
      console.log(`   📐 Dimensions: ${result.dimensions}`);
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.optimizedSize;
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }

    results.push(result);
  }

  // Summary
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 OPTIMIZATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`\n📊 Total original size: ${formatSize(totalOriginalSize)}`);
  console.log(`📊 Total optimized size: ${formatSize(totalOptimizedSize)}`);

  const totalReduction = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1);
  const savedBytes = totalOriginalSize - totalOptimizedSize;

  console.log(`📉 Total reduction: ${totalReduction}%`);
  console.log(`💾 Total saved: ${formatSize(savedBytes)}`);

  if (successful.length > 0) {
    console.log('\n✅ All WebP versions created successfully!');
    console.log('\n🔧 Next steps:');
    console.log('   1. Review optimized images');
    console.log('   2. Update image references in code (if needed)');
    console.log('   3. Test build: pnpm build');
    console.log('   4. Remove original PNG/JPG files (optional)');
  }
}

// Run
batchOptimize().catch(console.error);
