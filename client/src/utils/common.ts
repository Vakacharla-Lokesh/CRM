/**
 * Common Utilities
 * General utility functions
 */

/**
 * Deep clone object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj) as T;
  if (obj instanceof Array) return obj.map(deepClone) as T;
  
  const cloned: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }
  return cloned as T;
};

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export const deepMerge = <T extends Record<string, unknown>>(target: T, source: Partial<T>): T => {
  const result = { ...target };
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      if (sourceValue instanceof Object && !Array.isArray(sourceValue)) {
        result[key] = deepMerge(
          (result[key] || {}) as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }
  
  return result;
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} Is empty
 */
export const isEmpty = (obj: unknown): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Remove duplicates from array
 * @param {Array} arr - Array to process
 * @param {string} key - Key to check for uniqueness (for objects)
 * @returns {Array} Array without duplicates
 */
export const removeDuplicates = <T>(arr: T[], key: keyof T | null = null): T[] => {
  if (!Array.isArray(arr)) return [];
  
  if (key) {
    const seen = new Set();
    return arr.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  
  return [...new Set(arr)];
};

/**
 * Group array by key
 * @param {Array} arr - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = <T extends Record<string, unknown>>(arr: T[], key: keyof T): Record<string, T[]> => {
  if (!Array.isArray(arr)) return {};
  
  return arr.reduce((result: Record<string, T[]>, item: T) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 * @param {Array} arr - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order (asc/desc)
 * @returns {Array} Sorted array
 */
export const sortBy = <T extends Record<string, unknown>>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  if (!Array.isArray(arr)) return [];
  
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Sleep/delay
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} Result of function
 */
export const retry = async <T>(fn: () => Promise<T>, maxRetries: number = 3, delay: number = 1000): Promise<T> => {
  let lastError: unknown;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(delay * Math.pow(2, i));
      }
    }
  }
  
  throw lastError;
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(func: T, wait: number = 300): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in ms
 * @returns {Function} Throttled function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(func: T, limit: number = 300): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Compose functions (right to left)
 * @param {...Function} fns - Functions to compose
 * @returns {Function} Composed function
 */
export const compose = <T>(...fns: ((x: T) => T)[]): ((x: T) => T) => {
  return (x: T) => fns.reduceRight((acc, fn) => fn(acc), x);
};

/**
 * Pipe functions (left to right)
 * @param {...Function} fns - Functions to pipe
 * @returns {Function} Piped function
 */
export const pipe = <T>(...fns: ((x: T) => T)[]): ((x: T) => T) => {
  return (x: T) => fns.reduce((acc, fn) => fn(acc), x);
};

/**
 * Pick properties from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to pick
 * @returns {Object} Object with picked keys
 */
export const pick = <T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  return keys.reduce((result, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
};

/**
 * Omit properties from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to omit
 * @returns {Object} Object without omitted keys
 */
export const omit = <T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result as Omit<T, K>;
};

/**
 * Get nested object property safely
 * @param {Object} obj - Object to query
 * @param {string} path - Dot notation path
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Property value
 */
export const get = <T>(obj: Record<string, unknown>, path: string, defaultValue: T | undefined = undefined): T | undefined => {
  const keys = path.split('.');
  let result: unknown = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = (result as Record<string, unknown>)[key];
  }
  
  return result !== undefined ? (result as T) : defaultValue;
};

/**
 * Set nested object property safely
 * @param {Object} obj - Object to modify
 * @param {string} path - Dot notation path
 * @param {*} value - Value to set
 * @returns {Object} Modified object
 */
export const set = <T extends Record<string, unknown>>(obj: T, path: string, value: unknown): T => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current: Record<string, unknown> = obj;
  
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  
  if (lastKey) {
    current[lastKey] = value;
  }
  return obj;
};
