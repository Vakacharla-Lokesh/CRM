import { useState } from "react";
import { post } from "@/services/api/core";
import { useQueryClient } from "@tanstack/react-query";

interface BulkDeleteResponse {
  message: string;
  totalRequested: number;
  totalDeleted: number;
  failedIds: string[];
}

export function useBulkDeleteLeads() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const bulkDelete = async (ids: string[]): Promise<BulkDeleteResponse> => {
    setLoading(true);
    try {
      const result = await post<BulkDeleteResponse>("/leads/bulk-delete", {
        ids,
      });

      // Invalidate leads-related query caches
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({
        queryKey: ["analytics", "leadStatusBreakdown"],
      });

      return result;
    } finally {
      setLoading(false);
    }
  };

  return { bulkDelete, loading };
}
