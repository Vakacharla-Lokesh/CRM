import type {
  CreateOrganizationDTO,
  Organization,
  UpdateOrganizationDTO,
} from "@/types";

export interface OrganizationFormData {
  name: string;
  website: string;
  size: number;
  industry: string;
  city: string;
  country: string;
}

export interface FormErrors {
  name?: string;
  website?: string;
  size?: string;
  industry?: string;
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
