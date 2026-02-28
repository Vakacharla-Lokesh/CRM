import type {
  CreateOrganizationDTO,
  Organization,
  UpdateOrganizationDTO,
} from "@/types";

export interface OrganizationFormData {
  organizationName: string;
  organizationWebsite: string;
  organizationSize: number;
  organizationIndustry: string;
  city: string;
  country: string;
}

export interface FormErrors {
  organizationName?: string;
  organizationWebsite?: string;
  organizationSize?: string;
  organizationIndustry?: string;
  city?: string;
  country?: string;
}

export interface OrganizationModalProps {
  isOpen: boolean;
  organization: Organization | null;
  onClose: () => void;
  onSave: (organizationData: CreateOrganizationDTO) => Promise<void>;
  onUpdate?: (
    id: string,
    organizationData: UpdateOrganizationDTO,
  ) => Promise<void>;
}
