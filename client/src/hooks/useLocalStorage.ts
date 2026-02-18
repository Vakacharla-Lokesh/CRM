import { useState, useCallback } from "react";

/**
 * Local Storage Hook
 * Provides a simple interface for localStorage with type safety
 *
 * @param key - Storage key
 * @param initialValue - Initial value
 * @returns Current value, setter, and utilities
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return initialValue;
    }
  });

  /**
   * Update value in localStorage
   */
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error writing to localStorage:`, error);
      }
    },
    [key, storedValue],
  );

  /**
   * Remove item from localStorage
   */
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};

/**
 * Get value from local storage
 */
export const getFromLocalStorage = <T = unknown>(
  key: string,
  defaultValue?: T,
): T | null => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : (defaultValue ?? null);
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return defaultValue ?? null;
  }
};

/**
 * Save value to local storage
 */
export const saveToLocalStorage = <T>(key: string, value: T): boolean => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage:`, error);
    return false;
  }
};

/**
 * Remove value from local storage
 */
export const removeFromLocalStorage = (key: string): boolean => {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage:`, error);
    return false;
  }
};

/**
 * Clear all local storage
 */
export const clearLocalStorage = (): boolean => {
  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing localStorage:`, error);
    return false;
  }
};
