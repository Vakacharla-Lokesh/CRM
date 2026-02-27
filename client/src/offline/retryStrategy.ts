import type { RetryConfig } from "./batchTypes";

export class PermanentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermanentError";
  }
}

export const executeWithRetry = async <T>(
  batchFn: () => Promise<T>,
  config: RetryConfig = { maxRetries: 3, baseDelay: 500, multiplier: 2 },
): Promise<T> => {
  let attempt = 0;
  let delay = config.baseDelay;

  while (attempt < config.maxRetries) {
    try {
      return await batchFn();
    } catch (error: any) {
      const status = error?.status || error?.response?.status || 0;
      const permanentStatuses = [400, 401, 403, 404, 422];

      if (status && permanentStatuses.includes(status)) {
        throw new PermanentError(error.message || "Permanent error occurred");
      }

      attempt++;
      if (attempt >= config.maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= config.multiplier;
    }
  }

  throw new Error("Max retries exhausted without success");
};
