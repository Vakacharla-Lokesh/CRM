import type { Lead } from "@/types/leads";

export interface LeadGridProps {
  leads: Lead[];
  isLoading: boolean;
}

export interface SortConfig {
  key: keyof Lead;
  direction: "asc" | "desc";
}

export interface SortIconProps {
  column: keyof Lead;
}
