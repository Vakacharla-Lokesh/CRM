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

export function useBulkImportLeads() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const importLeads = async (file: File): Promise<BulkImportResult> => {
    setLoading(true);
    try {
      const result = await bulkAPI.importLeads(file);

      // Invalidate leads list and analytics so the table refreshes
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({
        queryKey: ["analytics", "statusBreakdown"],
      });

      return result;
    } finally {
      setLoading(false);
    }
  };

  return { importLeads, loading };
}
