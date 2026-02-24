import { useState, useCallback } from "react";

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

export const saveToLocalStorage = <T>(key: string, value: T): boolean => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage:`, error);
    return false;
  }
};

export const removeFromLocalStorage = (key: string): boolean => {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage:`, error);
    return false;
  }
};

export const clearLocalStorage = (): boolean => {
  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing localStorage:`, error);
    return false;
  }
};
