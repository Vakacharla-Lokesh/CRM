import { useState, useEffect, useCallback, useRef } from 'react';

interface FetchOptions<T> {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  cacheTime?: number;
  onSuccess?: ((data: T) => void) | null;
  onError?: ((error: Error) => void) | null;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * API Data Fetching Hook
 * Handles data fetching with caching, abort support, and error handling
 * 
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Object} Fetch state and utilities
 */
export const useFetch = <T = unknown>(url: string, options: FetchOptions<T> = {}) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const {
    method = 'GET',
    headers = {},
    body = null,
    cache = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    onSuccess = null,
    onError = null,
  } = options;

  /**
   * Fetch data from API
   */
  const fetchData = useCallback(async (fetchUrl: string = url, fetchOptions: Partial<FetchOptions<T>> = {}): Promise<T | undefined> => {
    // Check cache first
    if (cache && method === 'GET') {
      const cached = cacheRef.current.get(fetchUrl);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data);
        setLoading(false);
        return cached.data;
      }
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(fetchUrl, {
        method: fetchOptions.method || method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...fetchOptions.headers,
        },
        body: fetchOptions.body || body ? JSON.stringify(fetchOptions.body || body) : null,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      if (cache && method === 'GET') {
        cacheRef.current.set(fetchUrl, {
          data: result,
          timestamp: Date.now(),
        });
      }

      setData(result);
      setLoading(false);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }

      setError(error);
      setLoading(false);

      if (onError) {
        onError(error);
      }

      throw error;
    }
  }, [url, method, headers, body, cache, cacheTime, onSuccess, onError]);

  /**
   * Refetch data
   */
  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  /**
   * Clear cache
   */
  const clearCache = useCallback((cacheUrl: string | null = null) => {
    if (cacheUrl) {
      cacheRef.current.delete(cacheUrl);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  /**
   * Abort current request
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Auto-fetch on mount if URL is provided
  useEffect(() => {
    if (url) {
      fetchData();
    }

    // Cleanup: abort on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
    abort,
    fetch: fetchData,
  };
};
