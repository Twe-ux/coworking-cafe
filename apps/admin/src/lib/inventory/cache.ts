/**
 * Simple in-memory cache for inventory data
 * Reduces redundant API calls and improves performance
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class InventoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > this.TTL) {
      // Expired, remove from cache
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Store data in cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Remove specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Remove all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    const keys = Array.from(this.cache.keys())
    keys.forEach((key) => {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    })
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics (for debugging)
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Singleton instance
export const inventoryCache = new InventoryCache()

/**
 * Helper to generate cache keys
 */
export function getCacheKey(endpoint: string, params?: Record<string, string | undefined>): string {
  if (!params) return endpoint

  const queryString = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return queryString ? `${endpoint}?${queryString}` : endpoint
}

/**
 * Cache-aware fetch helper
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T | null> {
  // Only cache GET requests
  if (options?.method && options.method !== 'GET') {
    const res = await fetch(url, options)
    const data = await res.json()
    return data.success ? data.data : null
  }

  // Check cache first
  const cached = inventoryCache.get<T>(url)
  if (cached) {
    return cached
  }

  // Fetch from API
  const res = await fetch(url, options)
  const data = await res.json()

  if (data.success && data.data) {
    // Store in cache
    inventoryCache.set(url, data.data)
    return data.data
  }

  return null
}
