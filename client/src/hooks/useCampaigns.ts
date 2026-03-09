import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import campaignService, {
  type CampaignPayload,
} from "@/services/campaignService";
import { toast } from "sonner";

export const CAMPAIGNS_KEY = ["campaigns"] as const;

export function useCampaigns() {
  return useQuery({
    queryKey: CAMPAIGNS_KEY,
    queryFn: () => campaignService.getCampaigns(),
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CampaignPayload) => campaignService.createCampaign(data),
    onSuccess: (res) => {
      toast.success(`Campaign queued — ${res.total} email(s) will be sent`);
      qc.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create campaign");
    },
  });
}
