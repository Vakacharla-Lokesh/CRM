import type { OfflineRequest } from "../hooks/useOfflineManager";
import type { BatchExecutionResult } from "./batchTypes";
import { executeWithRetry } from "./retryStrategy";
import { getToken } from "../services/api/core";
import { resolveBulkRoute } from "./routeResolver";

export const processBatches = async (
  mutations: OfflineRequest[],
): Promise<BatchExecutionResult> => {
  if (mutations.length === 0) {
    return {
      processedCount: 0,
      failedBatchIndex: null,
      remainingMutations: [],
    };
  }

  const chunks: OfflineRequest[][] = [];
  for (let i = 0; i < mutations.length; i++) {
    const req = mutations[i];
    const lastChunk = chunks[chunks.length - 1];

    if (
      lastChunk &&
      lastChunk.length < 10 &&
      lastChunk[0].entityType === req.entityType
    ) {
      lastChunk.push(req);
    } else {
      chunks.push([req]);
    }
  }

  for (const chunk of chunks) {
    const tenantIds = new Set(
      chunk
        .map(
          (req) => (req.body as any)?.tenantId || (req.body as any)?.tenant_id,
        )
        .filter(Boolean),
    );
    if (tenantIds.size > 1) {
      console.error(
        "Mixed tenant mutations detected in a single batch. Aborting sync.",
        { chunk },
      );
      return {
        processedCount: 0,
        failedBatchIndex: 0,
        remainingMutations: mutations,
      };
    }
  }

  let processedCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const entityType = chunk[0].entityType;
    const tenantId =
      (chunk[0].body as any)?.tenantId || (chunk[0].body as any)?.tenant_id;

    const operations = chunk.map((req) => {
      return {
        ...(req.body as any),
        operation_type: req.operationType,
        timestamp: req.timestamp,
      };
    });

    const bodyPayload = {
      tenantId,
      operations,
    };

    const operationType = chunk[0].operationType;
    const endpoint = resolveBulkRoute(entityType, operationType);

    try {
      await executeWithRetry(async () => {
        const token = getToken();
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(bodyPayload),
        });

        if (!response.ok) {
          const err: any = new Error(
            `Batch HTTP error! status: ${response.status}`,
          );
          err.status = response.status;
          throw err;
        }
      });

      processedCount += chunk.length;
    } catch (error) {
      console.error(`Batch ${i} permanently failed:`, error);
      return {
        processedCount,
        failedBatchIndex: i,
        remainingMutations: mutations.slice(processedCount),
      };
    }
  }

  return {
    processedCount,
    failedBatchIndex: null,
    remainingMutations: [],
  };
};
