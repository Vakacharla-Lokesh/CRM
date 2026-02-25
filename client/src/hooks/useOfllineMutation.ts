import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { useOffline } from "@/context/";
import { queueMutationForOffline } from "./useOfflineManager";

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

/**
 * Enhanced mutation hook with offline queue support
 */
export function useOfflineMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(options: OfflineMutationOptions<TData, TError, TVariables, TContext>) {
  const { isOnline } = useOffline();

  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    onMutate: async (variables, context) => {
      // If offline, queue the mutation
      if (!isOnline) {
        queueMutationForOffline(options.mutationKey, variables);

        // Show user feedback
        console.log("📤 Mutation queued for offline sync");
      }

      // Call original onMutate if exists and return its result
      if (options.onMutate) {
        return await options.onMutate(variables, context);
      }

      // Return undefined as TContext when no onMutate provided
      return undefined as TContext;
    },
    onError: (error, variables, context, meta) => {
      // If offline, the mutation was already queued
      if (!isOnline) {
        console.log("⚠️ Mutation will retry when online");
      }

      // Call original onError if exists
      if (options.onError) {
        options.onError(error, variables, context, meta);
      }
    },
  });
}
