import type { CreateLeadDTO, Lead, LeadSource, LeadStatus } from "../../leads";

export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  organizationId: string;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  score?: string;
  organizationName?: string;
  organizationWebsite?: string;
  organizationSize?: string;
  organizationIndustry?: string;
}

export interface LeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onSave: (leadData: CreateLeadDTO) => void;
}
