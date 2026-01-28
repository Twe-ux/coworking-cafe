/**
 * Cloudinary utility functions
 * Upload, delete, and generate signed URLs for Cloudinary assets
 */

import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload a file to Cloudinary
 * @param file - Buffer or base64 string
 * @param folder - Folder in Cloudinary (e.g., "blog", "products")
 * @returns URL and public ID of uploaded file
 */
export const uploadToCloudinary = async (
  file: Buffer | string,
  folder: string = 'blog'
): Promise<{ url: string; publicId: string }> => {
  try {
    const result = await cloudinary.uploader.upload(file.toString('base64'), {
      folder,
      resource_type: 'auto',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete a file from Cloudinary
 * @param publicId - Public ID of the file
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error('Failed to delete image from Cloudinary');
  }
};

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
