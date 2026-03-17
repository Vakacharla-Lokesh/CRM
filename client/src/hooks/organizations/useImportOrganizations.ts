import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { bulkAPI } from "@/services";

export interface BulkImportResult {
  message: string;
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export function useBulkImportOrganizations() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const importOrganizations = async (file: File): Promise<BulkImportResult> => {
    setLoading(true);
    try {
      const result = await bulkAPI.importOrganizations(file);

      // Invalidate organizations list and analytics so the table refreshes
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({
        queryKey: ["analytics", "statusBreakdown"],
      });

      return result;
    } finally {
      setLoading(false);
    }
  };

  return { importOrganizations, loading };
}
