class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.ttlTimers = new Map();
  }

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

  delete(key) {
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
      this.ttlTimers.delete(key);
    }
    this.cache.delete(key);
  }

  clear() {
    // Clear all timers
    for (const timer of this.ttlTimers.values()) {
      clearTimeout(timer);
    }
    this.ttlTimers.clear();
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  has(key) {
    return this.cache.has(key) && this.get(key) !== null;
  }
}

// Singleton instance
const rolePermissionCache = new SimpleCache();

export default rolePermissionCache;
