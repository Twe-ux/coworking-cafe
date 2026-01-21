/**
 * Configuration centralisée des dimensions d'images
 * ⚠️ FICHIER SYNCHRONISÉ avec scripts/image-config.js
 *
 * Ce fichier est la version TypeScript de scripts/image-config.js
 * Pour modifier les dimensions, édite scripts/image-config.js
 * puis exécute: npm run sync:image-config (TODO: script à créer)
 *
 * Utilisé par:
 * - src/lib/image-optimizer.ts (optimisation automatique via dashboard)
 */

// Import depuis le fichier JS source
import imageConfig from '../../scripts/image-config.js';

export const IMAGE_CONFIGS = imageConfig.IMAGE_CONFIGS as Record<string, {
  width: number;
  height: number;
  quality: number;
  fit: 'cover' | 'inside' | 'contain';
}>;
