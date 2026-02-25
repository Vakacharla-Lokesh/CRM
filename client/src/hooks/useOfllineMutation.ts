/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { useOffline } from "@/context/";
import { useOfflineManager } from "./useOfflineManager";

interface OfflineMutationOptions<
  TData,
  TError,
  TVariables,
  TContext,
> extends Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  "mutationKey"
> {
  mutationKey: string[];
}

export function useOfflineMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(options: OfflineMutationOptions<TData, TError, TVariables, TContext>) {
  const { isOnline } = useOffline();
  const { addToQueue } = useOfflineManager();

  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    onMutate: async (variables, context) => {
      if (!isOnline) {
        const [entityType, operationType] = options.mutationKey;

        const entityTypeMap: Record<string, any> = {
          leads: "leads",
          deals: "deals",
          comments: "comments",
          calls: "calls",
          attachments: "attachments",
          organizations: "organizations",
          users: "users",
        };

        const mappedEntityType = entityTypeMap[entityType] || "leads";

        const operationMap: Record<string, any> = {
          create: "create",
          update: "update",
          delete: "delete",
        };

        const mappedOperation = operationMap[operationType] || "create";

        const idempotencyKey = addToQueue(
          `/api/${entityType}`,
          mappedOperation === "create"
            ? "POST"
            : mappedOperation === "update"
              ? "PUT"
              : "DELETE",
          variables,
          {},
          3,
          mappedEntityType,
          mappedOperation,
        );

        console.log(`📤 Mutation queued for offline sync (${idempotencyKey})`);

        throw new Error("OFFLINE_QUEUED");
      }

      if (options.onMutate) {
        return await options.onMutate(variables, context);
      }

      return undefined as TContext;
    },
    onError: (error, variables, context) => {
      if (error instanceof Error && error.message === "OFFLINE_QUEUED") {
        return;
      }

      if (options.onError) {
        options.onError(error, variables, context as TContext, {} as any);
      }
    },
  });
}
