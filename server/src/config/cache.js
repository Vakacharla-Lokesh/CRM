/**
 * Simple in-memory LRU cache for role permissions
 * Alternative: Use 'node-cache' npm package or Redis for production
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.ttlTimers = new Map();
  }

  /**
   * Get value from cache
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const item = this.cache.get(key);

    // Check if expired
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set value in cache with optional TTL
   * @param {string} key
   * @param {any} value
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, value, ttl = 300000) {
    // Clear existing timer if any
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
    }

    const expiresAt = ttl ? Date.now() + ttl : null;

    this.cache.set(key, { value, expiresAt });

    // Set TTL timer
    if (ttl) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl);

      this.ttlTimers.set(key, timer);
    }
  }

  /**
   * Delete key from cache
   * @param {string} key
   */
  delete(key) {
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
      this.ttlTimers.delete(key);
    }
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    // Clear all timers
    for (const timer of this.ttlTimers.values()) {
      clearTimeout(timer);
    }
    this.ttlTimers.clear();
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.cache.has(key) && this.get(key) !== null;
  }
}

// Singleton instance
const rolePermissionCache = new SimpleCache();

export default rolePermissionCache;
