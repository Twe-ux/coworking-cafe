/**
 * Custom event for triggering sidebar counts refresh
 * Used when actions modify badge counts (e.g., marking justification as read)
 */

const SIDEBAR_REFRESH_EVENT = 'sidebar-refresh'

export function triggerSidebarRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SIDEBAR_REFRESH_EVENT))
  }
}

export function onSidebarRefresh(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  window.addEventListener(SIDEBAR_REFRESH_EVENT, callback)
  return () => window.removeEventListener(SIDEBAR_REFRESH_EVENT, callback)
}
