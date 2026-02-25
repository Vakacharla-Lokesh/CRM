import { useCallback, useState } from "react";
import {
  parseError,
  logError,
  type AppError,
  shouldRetry,
  getRetryDelay,
} from "@/utils/errorHandler";
import { useAppContext } from "./useAppContext";

export interface UseErrorHandlerOptions {
  context?: string;
  onError?: (error: AppError) => void;
  shouldLogErrors?: boolean;
  maxRetries?: number;
}

export interface UseErrorHandlerState {
  error: AppError | null;
  isLoading: boolean;
  clearError: () => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    context = "App",
    onError,
    shouldLogErrors = true,
    maxRetries = 0,
  } = options;

  const { logout } = useAppContext();
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      onSuccess?: (data: T) => void,
    ): Promise<T | null> => {
      setIsLoading(true);
      clearError();

      let lastError: AppError | null = null;
      let attempts = 0;

      while (attempts <= maxRetries) {
        try {
          const result = await asyncFn();
          setIsLoading(false);

          if (onSuccess) {
            onSuccess(result);
          }

          return result;
        } catch (err) {
          attempts++;
          lastError = parseError(err);

          if (shouldLogErrors) {
            logError(lastError, context);
          }

          if (attempts <= maxRetries && shouldRetry(lastError, attempts - 1)) {
            const delay = getRetryDelay(attempts - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue; // Retry
          }

          break;
        }
      }

      if (lastError) {
        setError(lastError);

        if (lastError.category === "auth") {
          await logout();
        }

        if (onError) {
          onError(lastError);
        }

        setIsLoading(false);
        return null;
      }

      setIsLoading(false);
      return null;
    },
    [maxRetries, context, shouldLogErrors, onError, logout, clearError],
  );

  return {
    error,
    isLoading,
    execute,
    clearError,
  };
}

export function useAsyncOperation<T>(
  asyncFn: () => Promise<T>,
  options: UseErrorHandlerOptions & { autoRetry?: boolean } = {},
) {
  const {
    context = "App",
    onError,
    shouldLogErrors = true,
    autoRetry = true,
    maxRetries = autoRetry ? 2 : 0,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(
    async (overrideFn?: () => Promise<T>) => {
      setIsLoading(true);
      clearError();

      const fn = overrideFn || asyncFn;
      let lastError: AppError | null = null;

      for (let i = 0; i <= maxRetries; i++) {
        setAttempt(i + 1);

        try {
          const result = await fn();
          setData(result);
          setIsLoading(false);
          setAttempt(0);
          return result;
        } catch (err) {
          lastError = parseError(err);

          if (shouldLogErrors) {
            logError(lastError, context);
          }

          if (i < maxRetries && shouldRetry(lastError, i)) {
            const delay = getRetryDelay(i);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          break;
        }
      }

      // Failed after all retries
      if (lastError) {
        setError(lastError);
        if (onError) {
          onError(lastError);
        }
      }

      setIsLoading(false);
      setAttempt(0);
      return null;
    },
    [asyncFn, maxRetries, context, shouldLogErrors, onError, clearError],
  );

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    error,
    isLoading,
    attempt,
    execute,
    retry,
    clearError,
  };
}
