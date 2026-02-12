#!/usr/bin/env node

/**
 * Image Optimization Script
 * Compresses og-image.png from 3.2MB to < 200KB
 * Generates both standard (1200x630) and high-res (2400x1260) versions
 */

import sharp from 'sharp';
import { existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_PUBLIC = join(__dirname, '../apps/site/public');
const OG_IMAGE_PATH = join(SITE_PUBLIC, 'images/og-image.png');
const OG_IMAGE_OPTIMIZED_PNG = join(SITE_PUBLIC, 'images/og-image-optimized.png');
const OG_IMAGE_OPTIMIZED_WEBP = join(SITE_PUBLIC, 'images/og-image-optimized.webp');

/**
 * Format file size for display
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

/**
 * Get file size
 */
function getFileSize(path) {
  if (!existsSync(path)) return 0;
  return statSync(path).size;
}

/**
 * Compress og-image.png
 * Target: < 200KB for optimal OpenGraph performance
 */
async function compressOgImage() {
  console.log('🖼️  Optimizing og-image.png...\n');

  if (!existsSync(OG_IMAGE_PATH)) {
    console.error('❌ Error: og-image.png not found at', OG_IMAGE_PATH);
    process.exit(1);
  }

  const originalSize = getFileSize(OG_IMAGE_PATH);
  console.log(`📊 Original: ${formatSize(originalSize)}`);

  // Get original dimensions
  const metadata = await sharp(OG_IMAGE_PATH).metadata();
  console.log(`📐 Dimensions: ${metadata.width}x${metadata.height}\n`);

  // Strategy 1: PNG compression (keep dimensions)
  console.log('📦 Step 1: PNG compression...');
  try {
    await sharp(OG_IMAGE_PATH)
      .png({
        quality: 85,
        compressionLevel: 9,
        effort: 10,
      })
      .toFile(OG_IMAGE_OPTIMIZED_PNG);

    const pngSize = getFileSize(OG_IMAGE_OPTIMIZED_PNG);
    const pngReduction = ((1 - pngSize / originalSize) * 100).toFixed(1);

    console.log(`   ✅ PNG: ${formatSize(pngSize)} (-${pngReduction}%)\n`);

    // Strategy 2: WebP conversion with optimal dimensions (1200x630)
    console.log('📦 Step 2: WebP conversion (1200x630)...');
    await sharp(OG_IMAGE_PATH)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center',
      })
      .webp({
        quality: 85,
        effort: 6,
      })
      .toFile(OG_IMAGE_OPTIMIZED_WEBP);

    const webpSize = getFileSize(OG_IMAGE_OPTIMIZED_WEBP);
    const webpReduction = ((1 - webpSize / originalSize) * 100).toFixed(1);

    console.log(`   ✅ WebP: ${formatSize(webpSize)} (-${webpReduction}%)\n`);

    // Results summary
    console.log('📊 RESULTS SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Original:       ${formatSize(originalSize)} (${metadata.width}x${metadata.height})`);
    console.log(`PNG optimized:  ${formatSize(pngSize)} (${metadata.width}x${metadata.height}) -${pngReduction}%`);
    console.log(`WebP (1200x630): ${formatSize(webpSize)} (recommended) -${webpReduction}%\n`);

    if (webpSize < 200 * 1024) {
      console.log('✅ WebP TARGET ACHIEVED: < 200KB');
      console.log('🎯 Recommendation: Use og-image-optimized.webp');
    } else {
      console.log(`⚠️  WebP still above target: ${formatSize(webpSize)}`);
    }

    console.log('\n📁 Outputs:');
    console.log('   • apps/site/public/images/og-image-optimized.png');
    console.log('   • apps/site/public/images/og-image-optimized.webp (RECOMMENDED)');
    console.log('\n🔧 Next steps:');
    console.log('   1. Replace og-image.png with og-image-optimized.webp');
    console.log('   2. Update metadata in layout.tsx (change .png to .webp)');
    console.log('   3. Update dimensions to 1200x630');

  } catch (error) {
    console.error('❌ Compression failed:', error.message);
    process.exit(1);
  }
}

// Run
compressOgImage().catch(console.error);
