import { useState } from "react";
import { post } from "@/services/api/core";
import { useQueryClient } from "@tanstack/react-query";

interface BulkDeleteResponse {
  message: string;
  totalRequested: number;
  totalDeleted: number;
  failedIds: string[];
}

export function useBulkDeleteDeals() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const bulkDelete = async (ids: string[]): Promise<BulkDeleteResponse> => {
    setLoading(true);
    try {
      // const result = await post<BulkDeleteResponse>("/deals/bulk-delete", {
      //   ids,
      // });

      const result = await post<BulkDeleteResponse>("/bulk/deals/delete", {
        ids,
      });

      // Invalidate deals-related query caches
      await queryClient.invalidateQueries({ queryKey: ["deals"] });
      await queryClient.invalidateQueries({
        queryKey: ["analytics", "dealPipeline"],
      });

      return result;
    } finally {
      setLoading(false);
    }
  };

  return { bulkDelete, loading };
}
