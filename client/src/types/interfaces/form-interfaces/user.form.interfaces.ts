import type { CreateUserDTO, User, UserRole } from "@/types";

export interface UserFormData {
  firstName: string;
  lastName: string;
  userEmail: string;
  mobile: string;
  role: UserRole;
  roleId?: string;
  password: string;
  tenantId: string;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  userEmail?: string;
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
