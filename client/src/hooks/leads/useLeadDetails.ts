import { useState, useEffect } from "react";
import { leadService } from "@/services";
import type { Lead } from "@/types";

interface UseLeadDetailsReturn {
  lead: Lead | null;
  loading: boolean;
  error: string | null;
  updateLead: (updatedLead: Lead) => void;
}

export function useLeadDetails(id: string | undefined): UseLeadDetailsReturn {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLead = async () => {
      if (!id) {
        setError("Lead ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await leadService.getLeadById(id);
        setLead(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lead");
        console.error("Error fetching lead:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const updateLead = (updatedLead: Lead) => {
    setLead(updatedLead);
  };

  return { lead, loading, error, updateLead };
}
