import { useState } from "react";
import { post } from "@/services/api/core";
import { useQueryClient } from "@tanstack/react-query";

interface BulkDeleteResponse {
  message: string;
  totalRequested: number;
  totalDeleted: number;
  failedIds: string[];
}

export function useBulkDeleteOrganizations() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const bulkDelete = async (ids: string[]): Promise<BulkDeleteResponse> => {
    setLoading(true);
    try {
      // const result = await post<BulkDeleteResponse>(
      //   "/organizations/bulk-delete",
      //   { ids },
      // );

      const result = await post<BulkDeleteResponse>(
        "/bulk/organizations/delete",
        { ids },
      );

      // Invalidate organizations-related query caches
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({
        queryKey: ["analytics", "organizationStats"],
      });

      return result;
    } finally {
      setLoading(false);
    }
  };

  return { bulkDelete, loading };
}
