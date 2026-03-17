import { useState } from "react";
import { toast } from "sonner";
import { leadService } from "@/services";
import type { Lead } from "@/types";
import { useNotifications } from "@/hooks";

interface UseLeadStageManagementReturn {
  isUpdatingStatus: boolean;
  isConverting: boolean;
  handleStageChange: (
    leadId: string,
    newStatus: string,
    currentStatus: string,
  ) => Promise<void>;
  handleConvertToDeal: (leadToConvert: Lead) => Promise<{
    lead: Lead;
  }>;
}

export function useLeadStageManagement(
  onLeadUpdate: (lead: Lead) => void,
): UseLeadStageManagementReturn {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const { notifyEvent } = useNotifications();

  const handleStageChange = async (
    leadId: string,
    newStatus: string,
    currentStatus: string,
  ) => {
    if (newStatus === currentStatus) return;

    try {
      setIsUpdatingStatus(true);
      const response = await leadService.updateLead(leadId, {
        status: newStatus,
      });
      onLeadUpdate(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConvertToDeal = async (lead: Lead) => {
    try {
      setIsConverting(true);
      const response = await leadService.convertLead(lead._id);

      notifyEvent({
        type: "lead_converted",
        title: "Lead Converted",
        message: `Lead ${lead.firstName} ${lead.lastName || ""} has been converted to a deal successfully.`,
        entityId: lead._id,
        entityType: "lead",
      });

      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to convert lead to deal";
      toast.error(message);
      throw err;
    } finally {
      setIsConverting(false);
    }
  };

  return {
    isUpdatingStatus,
    isConverting,
    handleStageChange,
    handleConvertToDeal,
  };
}
