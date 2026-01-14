/**
 * Helper functions for email templates
 */

import { getSpaceTypeLabel, getDbSpaceTypeLabel } from '@/lib/space-types';

/**
 * Convert technical space IDs to French display names
 * Supports both URL slugs and database values
 */
export function getSpaceDisplayName(spaceName: string): string {
  // Try URL slug first
  const urlLabel = getSpaceTypeLabel(spaceName);
  if (urlLabel !== spaceName) {
    return urlLabel;
  }

  // Try database type
  const dbLabel = getDbSpaceTypeLabel(spaceName);
  if (dbLabel !== spaceName) {
    return dbLabel;
  }

  // Return as-is if not found
  return spaceName;
}
