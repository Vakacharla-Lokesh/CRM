import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import campaignService, {
  type CampaignPayload,
  type TemplatePayload,
} from "@/services/campaignService";
import { toast } from "sonner";

export const CAMPAIGNS_KEY = ["campaigns"] as const;
export const TEMPLATES_KEY = ["campaign-templates"] as const;

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

export function useCampaignTemplates() {
  return useQuery({
    queryKey: TEMPLATES_KEY,
    queryFn: () => campaignService.getTemplates(),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TemplatePayload) => campaignService.createTemplate(data),
    onSuccess: () => {
      toast.success("Template saved");
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save template");
    },
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TemplatePayload>;
    }) => campaignService.updateTemplate(id, data),
    onSuccess: () => {
      toast.success("Template updated");
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update template");
    },
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => campaignService.deleteTemplate(id),
    onSuccess: () => {
      toast.success("Template deleted");
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete template");
    },
  });
}

export function useIncrementTemplateUsage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => campaignService.incrementTemplateUsage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY });
    },
  });
}
