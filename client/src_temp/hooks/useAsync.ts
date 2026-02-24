import { useState, useCallback } from "react";

export const useAsync = <T = unknown>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>, retries = 0): Promise<T> => {
      setLoading(true);
      setError(null);

      let lastError: Error | null = null;
      let attempts = 0;

      while (attempts <= retries) {
        try {
          const result = await asyncFunction();
          setData(result);
          setLoading(false);
          return result;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          attempts++;

          if (attempts <= retries) {
            await new Promise((resolve) =>
              setTimeout(
                resolve,
                Math.min(1000 * Math.pow(2, attempts - 1), 10000),
              ),
            );
          }
        }
      }

      setError(lastError);
      setLoading(false);
      throw lastError;
    },
    [],
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  const setErrorManually = useCallback((err: Error) => {
    setError(err);
    setLoading(false);
  }, []);

  const executeWithRetry = useCallback(
    async (asyncFunction: () => Promise<T>, maxRetries = 3): Promise<T> => {
      return execute(asyncFunction, maxRetries);
    },
    [execute],
  );

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
