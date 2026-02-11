/**
 * Utility for tracking when badge sections were last viewed.
 * Uses localStorage to persist "last seen" timestamps.
 * Badge only shows items created AFTER the last seen timestamp.
 */

const STORAGE_KEY_PREFIX = 'badge-seen-';

/**
 * Mark a badge section as seen (stores current timestamp)
 */
export function markBadgeSeen(section: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    `${STORAGE_KEY_PREFIX}${section}`,
    new Date().toISOString()
  );
}

/**
 * Get the last seen timestamp for a badge section
 * @returns ISO string or null if never seen
 */
export function getBadgeSeenAt(section: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${STORAGE_KEY_PREFIX}${section}`);
}
