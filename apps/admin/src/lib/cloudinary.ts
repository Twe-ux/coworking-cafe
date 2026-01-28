/**
 * Cloudinary utility functions
 * Génération d'URLs signées pour l'accès aux fichiers privés
 *
 * NOTE: Ce fichier utilise crypto natif (pas besoin du package cloudinary)
 */

import crypto from 'crypto';

/**
 * Generate a signed URL for a private Cloudinary asset
 * @param publicId - The public ID of the asset (e.g., "deposits/abc123.pdf")
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL valid for the specified duration
 */
export function generateSignedUrl(publicId: string, expiresIn: number = 3600): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiSecret) {
    throw new Error('Cloudinary configuration missing');
  }

  const timestamp = Math.floor(Date.now() / 1000) + expiresIn;

  // Generate signature
  const toSign = `timestamp=${timestamp}${apiSecret}`;
  const signature = crypto
    .createHash('sha256')
    .update(toSign)
    .digest('hex');

  // Build signed URL
  const signedUrl = `https://res.cloudinary.com/${cloudName}/image/authenticated/s--${signature}--/v1/${publicId}?ts=${timestamp}`;

  return signedUrl;
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - Full Cloudinary URL
 * @returns Public ID (e.g., "deposits/abc123.pdf")
 */
export function extractPublicIdFromUrl(url: string): string | null {
  // Example URL: https://res.cloudinary.com/dcxm5txfz/image/upload/v1769588718/deposits/file.pdf
  const match = url.match(/\/upload\/(?:v\d+\/)?(.*?)(?:\.|$)/);
  return match ? match[1] : null;
}

/**
 * Replace Cloudinary URL with signed URL
 * @param url - Original Cloudinary URL
 * @param expiresIn - Expiration time in seconds
 * @returns Signed URL or original URL if extraction fails
 */
export function getSignedCloudinaryUrl(url: string, expiresIn: number = 3600): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url; // Return as-is if not a Cloudinary URL
  }

  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) {
    console.error('Failed to extract public ID from URL:', url);
    return url;
  }

  return generateSignedUrl(publicId, expiresIn);
}
