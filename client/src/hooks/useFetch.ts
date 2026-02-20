import { useState, useEffect, useCallback, useRef } from "react";

interface FetchOptions<T> {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  cache?: boolean;
  cacheTime?: number;
  onSuccess?: ((data: T) => void) | null;
  onError?: ((error: Error) => void) | null;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const useFetch = <T = unknown>(
  url: string,
  options: FetchOptions<T> = {},
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const {
    method = "GET",
    headers = {},
    body = null,
    cache = true,
    cacheTime = 5 * 60 * 1000,
    onSuccess = null,
    onError = null,
  } = options;

  const fetchData = useCallback(
    async (
      fetchUrl: string = url,
      fetchOptions: Partial<FetchOptions<T>> = {},
    ): Promise<T | undefined> => {
      if (cache && method === "GET") {
        const cached = cacheRef.current.get(fetchUrl);
        if (cached && Date.now() - cached.timestamp < cacheTime) {
          setData(cached.data);
          setLoading(false);
          onSuccess?.(cached.data);
          return cached.data;
        }
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const finalMethod = fetchOptions.method || method;
        const finalHeaders = {
          "Content-Type": "application/json",
          ...headers,
          ...fetchOptions.headers,
        };

        const finalBody =
          fetchOptions.body !== undefined ? fetchOptions.body : body;

        const response = await fetch(fetchUrl, {
          method: finalMethod,
          headers: finalHeaders,
          body:
            finalBody && finalMethod !== "GET"
              ? JSON.stringify(finalBody)
              : null,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // Response is not JSON, use default message
          }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();

        if (cache && method === "GET") {
          cacheRef.current.set(fetchUrl, {
            data: responseData,
            timestamp: Date.now(),
          });
        }

        setData(responseData);
        setLoading(false);
        onSuccess?.(responseData);
        return responseData;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return undefined;
        }

        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setLoading(false);
        onError?.(error);
        throw error;
      }
    },
    [url, method, headers, body, cache, cacheTime, onSuccess, onError],
  );

  const refetch = useCallback(async () => {
    return fetchData(url);
  }, [fetchData, url]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  useEffect(() => {
    if (method === "GET") {
      fetchData(url).catch((err) => {
        console.error("Fetch error:", err);
      });
    }
  }, [url]);

  return {
    data,
    loading,
    error,
    fetchData,
    refetch,
    clearCache,
  };
};
