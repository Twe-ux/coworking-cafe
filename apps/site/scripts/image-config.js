/**
 * Configuration centralisée des dimensions d'images
 * Utilisé par: src/lib/image-optimizer.ts
 */

module.exports = {
  IMAGE_CONFIGS: {
    // Blog images
    'blog/cover': {
      width: 1200,
      height: 630,
      quality: 85,
      fit: 'cover'
    },
    'blog/thumbnail': {
      width: 400,
      height: 300,
      quality: 80,
      fit: 'cover'
    },
    'blog/content': {
      width: 800,
      height: 600,
      quality: 85,
      fit: 'inside'
    },

    // Profile images
    'profile/avatar': {
      width: 200,
      height: 200,
      quality: 90,
      fit: 'cover'
    },

    // Space images
    'spaces/cover': {
      width: 1200,
      height: 800,
      quality: 90,
      fit: 'cover'
    },
    'spaces/gallery': {
      width: 800,
      height: 600,
      quality: 85,
      fit: 'cover'
    },

    // Menu images
    'menu/item': {
      width: 400,
      height: 400,
      quality: 85,
      fit: 'cover'
    },

    // Default config
    'default': {
      width: 1200,
      height: 800,
      quality: 85,
      fit: 'inside'
    }
  }
};
