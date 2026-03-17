import type { CreateLeadDTO, Lead, LeadSource, LeadStatus } from "../../leads";

export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  organizationId: string;
  assignedTo?: string;
  pipelineId?: string;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  score?: string;
  name?: string;
  website?: string;
  size?: string;
  industry?: string;
}

export interface LeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onSave: (leadData: CreateLeadDTO) => void;
}
