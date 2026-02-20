import type { CreateTenantDto, Tenant } from "@/types";

export interface TenantFormData {
  tenantName: string;
  email: string;
  mobile: string;
}

export interface FormErrors {
  tenantName?: string;
  email?: string;
  mobile?: string;
}

export interface TenantModalProps {
  isOpen: boolean;
  tenant: Tenant | null;
  onClose: () => void;
  onSave: (tenantData: CreateTenantDto) => Promise<void>;
}
