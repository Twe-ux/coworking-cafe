import sharp from 'sharp';
import { IMAGE_CONFIGS } from '@/config/image-dimensions';

export interface OptimizeOptions {
  folder?: string;
  format?: 'webp' | 'jpeg' | 'png';
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface OptimizedImage {
  buffer: Buffer;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
    originalSize: number;
    savings: number;
  };
}

/**
 * Optimise une image automatiquement selon sa catégorie
 */
export async function optimizeImage(
  buffer: Buffer,
  options: OptimizeOptions = {}
): Promise<OptimizedImage> {
  try {
    // Déterminer la configuration selon le dossier
    const category = options.folder?.toLowerCase() || 'default';
    const config = IMAGE_CONFIGS[category] || IMAGE_CONFIGS.default;

    // Récupérer les métadonnées originales
    const originalMetadata = await sharp(buffer).metadata();
    const originalSize = buffer.length;

    // Format de sortie (défaut: WebP pour meilleure compression)
    const outputFormat = options.format || 'webp';

    // Dimensions finales (priorité aux options personnalisées)
    const width = options.maxWidth || config.width;
    const height = options.maxHeight || config.height;
    const quality = options.quality || config.quality;

    // Optimiser l'image
    let pipeline = sharp(buffer);

    // Redimensionner si nécessaire
    if (originalMetadata.width && originalMetadata.height) {
      // Ne pas agrandir les petites images
      if (originalMetadata.width > width || originalMetadata.height > height) {
        pipeline = pipeline.resize(width, height, {
          fit: config.fit,
          position: 'center',
          withoutEnlargement: true
        });
      }
    }

    // Convertir au format souhaité
    if (outputFormat === 'webp') {
      pipeline = pipeline.webp({
        quality,
        effort: 4 // 0-6, balance entre vitesse et compression
      });
    } else if (outputFormat === 'jpeg') {
      pipeline = pipeline.jpeg({
        quality,
        progressive: true
      });
    } else if (outputFormat === 'png') {
      pipeline = pipeline.png({
        compressionLevel: 9,
        quality
      });
    }

    // Générer l'image optimisée
    const optimizedBuffer = await pipeline.toBuffer();
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();

    // Calculer les économies
    const savings = originalSize > 0
      ? Math.round(((originalSize - optimizedBuffer.length) / originalSize) * 100)
      : 0;

    return {
      buffer: optimizedBuffer,
      metadata: {
        width: optimizedMetadata.width || width,
        height: optimizedMetadata.height || height,
        format: optimizedMetadata.format || outputFormat,
        size: optimizedBuffer.length,
        originalSize,
        savings
      }
    };
  } catch (error) {
    // En cas d'erreur, retourner l'image originale
    const metadata = await sharp(buffer).metadata();
    return {
      buffer,
      metadata: {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: buffer.length,
        originalSize: buffer.length,
        savings: 0
      }
    };
  }
}

/**
 * Vérifie si un fichier est une image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Détermine si une image devrait être optimisée
 */
export function shouldOptimize(mimeType: string, size: number): boolean {
  // Ne pas optimiser les GIF animés et les SVG
  if (mimeType === 'image/gif' || mimeType === 'image/svg+xml') {
    return false;
  }

  // Ne pas optimiser les très petites images (< 5KB)
  if (size < 5 * 1024) {
    return false;
  }

  return isImageFile(mimeType);
}

/**
 * Obtenir la configuration pour une catégorie
 */
export function getConfigForCategory(category: string) {
  return IMAGE_CONFIGS[category.toLowerCase()] || IMAGE_CONFIGS.default;
}
