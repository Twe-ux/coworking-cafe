/**
 * Helper functions for email templates
 */

import { getSpaceTypeLabel, getDbSpaceTypeLabel } from "../space-types"

/**
 * Convert technical space IDs to French display names
 * Supports both URL slugs and database values
 */
export function getSpaceDisplayName(spaceName: string): string {
  // Try URL slug first
  const urlLabel = getSpaceTypeLabel(spaceName)
  if (urlLabel !== spaceName) {
    return urlLabel
  }

  // Try database type
  const dbLabel = getDbSpaceTypeLabel(spaceName)
  if (dbLabel !== spaceName) {
    return dbLabel
  }

  // Return as-is if not found
  return spaceName
}

/**
 * Generate price disclaimer note (asterisk explanation)
 * To be displayed below total price in all booking emails
 */
export function getPriceDisclaimerNote(): string {
  return `
    <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        <strong style="color: #92400e;">* Prix indicatif</strong> – Le montant final sera calculé en fonction du temps réellement passé sur place et des éventuels produits additionnels consommés. Le règlement s'effectuera sur place.
      </p>
    </div>
  `;
}
