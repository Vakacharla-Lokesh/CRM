import type { OfflineRequest } from "../hooks/useOfflineManager";

export type MutationOperation = Record<string, any>;

export interface BatchExecutionResult {
  processedCount: number;
  failedBatchIndex: number | null;
  remainingMutations: OfflineRequest[];
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  multiplier: number;
}
