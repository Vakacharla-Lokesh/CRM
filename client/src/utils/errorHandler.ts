export type ErrorCategory =
  | "validation"
  | "network"
  | "auth"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "server"
  | "offline"
  | "unknown";

export interface AppError {
  category: ErrorCategory;
  statusCode: number;
  message: string;
  userMessage: string;
  details?: Record<string, unknown>;
  isRetryable: boolean;
  timestamp: Date;
}

export function parseError(error: unknown): AppError {
  const timestamp = new Date();

  if (!error) {
    return {
      category: "unknown",
      statusCode: 0,
      message: "An unknown error occurred",
      userMessage: "Something went wrong. Please try again.",
      isRetryable: true,
      timestamp,
    };
  }

  if (typeof error === "object" && "statusCode" in error) {
    const apiError = error as any;
    return parseAPIError(apiError, timestamp);
  }

  if (error instanceof Error) {
    return parseNativeError(error, timestamp);
  }

  if (typeof error === "string") {
    return {
      category: "unknown",
      statusCode: 0,
      message: error,
      userMessage: error,
      isRetryable: false,
      timestamp,
    };
  }

  return {
    category: "unknown",
    statusCode: 0,
    message: JSON.stringify(error),
    userMessage: "An unexpected error occurred. Please contact support.",
    isRetryable: false,
    timestamp,
  };
}

function parseAPIError(error: any, timestamp: Date): AppError {
  const statusCode = error.statusCode || error.status || 0;
  const responseData = error.data || {};
  const message = error.message || "API request failed";

  // Validation error (400 + errors array)
  if (statusCode === 400) {
    return {
      category: "validation",
      statusCode,
      message: responseData.message || "Validation failed",
      userMessage: formatValidationErrors(responseData.errors),
      details: responseData.errors
        ? { errors: responseData.errors }
        : undefined,
      isRetryable: false,
      timestamp,
    };
  }

  // Authentication error (401)
  if (statusCode === 401) {
    return {
      category: "auth",
      statusCode,
      message: message,
      userMessage: "Your session has expired. Please log in again.",
      isRetryable: false,
      timestamp,
    };
  }

  // Forbidden error (403)
  if (statusCode === 403) {
    return {
      category: "forbidden",
      statusCode,
      message: message,
      userMessage: "You don't have permission to perform this action.",
      isRetryable: false,
      timestamp,
    };
  }

  // Not found (404)
  if (statusCode === 404) {
    return {
      category: "not_found",
      statusCode,
      message: message,
      userMessage: "The resource you're looking for doesn't exist.",
      isRetryable: false,
      timestamp,
    };
  }

  // Conflict error (409) - e.g., duplicate entry
  if (statusCode === 409) {
    return {
      category: "conflict",
      statusCode,
      message: message,
      userMessage: `${responseData.field || "This item"} already exists. Please use a different value.`,
      details: { field: responseData.field },
      isRetryable: false,
      timestamp,
    };
  }

  // Server error (5xx)
  if (statusCode >= 500) {
    return {
      category: "server",
      statusCode,
      message: message,
      userMessage: "A server error occurred. Please try again later.",
      isRetryable: true,
      timestamp,
    };
  }

  // Generic/unmapped error
  return {
    category: "unknown",
    statusCode,
    message: message,
    userMessage: message || "An error occurred. Please try again.",
    isRetryable: statusCode >= 500 || statusCode === 0,
    timestamp,
  };
}

function parseNativeError(error: Error, timestamp: Date): AppError {
  const message = error.message || "An error occurred";

  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("offline")
  ) {
    return {
      category: "network",
      statusCode: 0,
      message: message,
      userMessage: "Network connection error. Please check your connection.",
      isRetryable: true,
      timestamp,
    };
  }

  return {
    category: "unknown",
    statusCode: 0,
    message: message,
    userMessage: message,
    isRetryable: false,
    timestamp,
  };
}

function formatValidationErrors(errors: unknown): string {
  if (!errors) return "Validation failed. Please check your input.";

  if (Array.isArray(errors)) {
    if (errors.length === 0) return "Validation failed.";
    if (errors.length === 1) {
      const err = errors[0];
      return typeof err === "string"
        ? err
        : (err as any).message || "Invalid input";
    }
    return `${errors.length} validation errors found. Please review your input.`;
  }

  if (typeof errors === "object") {
    const errorEntries = Object.entries(errors).slice(0, 3);
    if (errorEntries.length === 0) return "Validation failed.";

    const messages = errorEntries
      .map(([field, err]) => {
        const message =
          typeof err === "string" ? err : (err as any)?.message || "Invalid";
        return `${field}: ${message}`;
      })
      .join("; ");

    return messages;
  }

  return "Validation failed. Please check your input.";
}

export function logError(error: AppError, context?: string): void {
  const timestamp = error.timestamp.toISOString();
  const prefix = context ? `[${context}]` : "[Error]";

  console.error(
    `${prefix} ${error.category.toUpperCase()} (${error.statusCode}) @ ${timestamp}`,
    error.message,
  );

  if (error.details) {
    console.error(`  Details:`, error.details);
  }
}

export function shouldRetry(error: AppError, attemptCount: number): boolean {
  if (!error.isRetryable) return false;
  if (attemptCount >= 3) return false; // Max 3 retries
  return true;
}

export function getRetryDelay(attemptCount: number): number {
  return Math.min(1000 * Math.pow(2, attemptCount), 10000); // Max 10s
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  onRetry?: (error: AppError, attempt: number) => void,
): Promise<T> {
  let lastError: AppError | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = parseError(error);

      if (attempt < maxAttempts && shouldRetry(lastError, attempt)) {
        const delay = getRetryDelay(attempt - 1);
        if (onRetry) onRetry(lastError, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw lastError;
      }
    }
  }

  throw lastError || new Error("Unknown error");
}
