import type { CreateUserDTO, User, UserRole } from "@/types";

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: UserRole;
  password: string;
  tenantId: string;
  permissions?: string[];
  roleId?: string;
}

export interface UserFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  password?: string;
  tenantId?: string;
}

export interface UserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userData: CreateUserDTO) => Promise<void>;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  password?: string;
  tenantId?: string;
}
