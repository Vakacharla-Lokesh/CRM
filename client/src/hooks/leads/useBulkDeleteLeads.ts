import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { bulkAPI } from "@/services";

interface BulkDeleteResponse {
  message: string;
  totalRequested: number;
  totalDeleted: number;
  failedIds: string[];
}

export function useBulkDeleteLeads() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const bulkDelete = async (
    ids: string[],
  ): Promise<BulkDeleteResponse> => {
    setLoading(true);
    try {
      // const result = await post<BulkDeleteResponse>("/leads/bulk-delete", {
      //   ids,
      // });

      const result = await bulkAPI.deleteLeads(ids);

      // Invalidate leads-related query caches
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({
        queryKey: ["analytics", "statusBreakdown"],
      });

      return result;
    } finally {
      setLoading(false);
    }
  };

  return { bulkDelete, loading };
}
