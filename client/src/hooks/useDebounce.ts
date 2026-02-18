import { useState, useEffect } from 'react';

/**
 * Debounce Hook
 * Delays updating a value until after a specified delay
 * 
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500)
 * @returns {*} Debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
