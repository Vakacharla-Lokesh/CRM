import { useState, useEffect, useCallback } from "react";
import type { Call, CreateCallDTO, UpdateCallDTO } from "../types";
import { callsAPI } from "../services";

/**
 * Hook for managing calls for a specific lead
 */
export const useCallData = (leadId: string) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all calls for the lead
   */
  const fetchCalls = useCallback(async () => {
    if (!leadId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await callsAPI.getByLead(leadId);
      setCalls(response.calls);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load calls";
      setError(message);
      console.error("Error fetching calls:", err);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  /**
   * Create a new call
   */
  const createCall = useCallback(
    async (data: Omit<CreateCallDTO, "leadId">) => {
      try {
        setError(null);
        const newCall = await callsAPI.create({ ...data, leadId });
        setCalls((prev) => [newCall, ...prev]);
        return newCall;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create call";
        setError(message);
        console.error("Error creating call:", err);
        throw err;
      }
    },
    [leadId],
  );

  /**
   * Update an existing call
   */
  const updateCall = useCallback(async (id: string, data: UpdateCallDTO) => {
    try {
      setError(null);
      const updatedCall = await callsAPI.update(id, data);
      setCalls((prev) =>
        prev.map((call) => (call._id === id ? updatedCall : call)),
      );
      return updatedCall;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update call";
      setError(message);
      console.error("Error updating call:", err);
      throw err;
    }
  }, []);

  /**
   * Delete a call
   */
  const deleteCall = useCallback(async (id: string) => {
    try {
      setError(null);
      await callsAPI.delete(id);
      setCalls((prev) => prev.filter((call) => call._id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete call";
      setError(message);
      console.error("Error deleting call:", err);
      throw err;
    }
  }, []);

  /**
   * Refresh calls list
   */
  const refresh = useCallback(() => {
    fetchCalls();
  }, [fetchCalls]);

  // Fetch calls on mount or when leadId changes
  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  return {
    calls,
    loading,
    error,
    createCall,
    updateCall,
    deleteCall,
    refresh,
  };
};
