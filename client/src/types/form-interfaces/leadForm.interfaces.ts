import type { CreateLeadDTO, Lead, LeadSource, LeadStatus } from "../leads";

export interface LeadFormData {
  leadFirstName: string;
  leadLastName: string;
  leadEmail: string;
  leadSource: LeadSource;
  leadStatus: LeadStatus;
  leadScore: number;
  organizationId: string;
  notes: string;
}

export interface FormErrors {
  leadFirstName?: string;
  leadLastName?: string;
  leadEmail?: string;
  leadScore?: string;
}

export interface LeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onSave: (leadData: CreateLeadDTO) => void;
}
