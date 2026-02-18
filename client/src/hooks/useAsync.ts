import { useState, useCallback } from 'react';

/**
 * Generic Async Handler Hook
 * Manages loading, error states, and retry logic for async operations
 * 
 * @returns {Object} Async execution utilities
 */
export const useAsync = <T = unknown>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  /**
   * Execute async function with error handling
   * @param {Function} asyncFunction - Async function to execute
   * @param {number} retries - Number of retry attempts (default: 0)
   * @returns {Promise} Result of async function
   */
  const execute = useCallback(async (asyncFunction: () => Promise<T>, retries = 0): Promise<T> => {
    setLoading(true);
    setError(null);

    let lastError = null;
    let attempts = 0;

    while (attempts <= retries) {
      try {
        const result = await asyncFunction();
        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        lastError = err as Error;
        attempts++;
        
        if (attempts <= retries) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, Math.min(1000 * Math.pow(2, attempts - 1), 10000))
          );
        }
      }
    }

    // All retries failed
    setError(lastError);
    setLoading(false);
    throw lastError;
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  /**
   * Set error manually
   * @param {Error} err - Error object
   */
  const setErrorManually = useCallback((err: Error) => {
    setError(err);
    setLoading(false);
  }, []);

  /**
   * Execute with retry logic
   * @param {Function} asyncFunction - Async function to execute
   * @param {number} maxRetries - Maximum retry attempts (default: 3)
   */
  const executeWithRetry = useCallback(async (asyncFunction: () => Promise<T>, maxRetries = 3): Promise<T> => {
    return execute(asyncFunction, maxRetries);
  }, [execute]);

  return {
    loading,
    error,
    data,
    execute,
    executeWithRetry,
    reset,
    setError: setErrorManually,
  };
};
