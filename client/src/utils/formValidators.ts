import type {
  OrganizationFormData,
  FormErrors as OrgFormErrors,
} from "@/types/interfaces/form-interfaces/organization.form.interfaces";
import type {
  UserFormData,
  FormErrors as UserFormErrors,
} from "@/types/interfaces/form-interfaces/user.form.interfaces";
import type {
  TenantFormData,
  FormErrors as TenantFormErrors,
} from "@/types/interfaces/form-interfaces/tenant.form.interfaces";
import type {
  LeadFormData,
  FormErrors as LeadFormErrors,
} from "@/types/interfaces/form-interfaces/lead.form.interfaces";

// Constants for validation
const URL_REGEX =
  /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!/-]))?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[1-9]\d{9}$/;
const TENANTED_EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

export interface SettingsFormData {
  firstName: string;
  lastName: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SettingsFormErrors {
  firstName?: string;
  lastName?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function validateSettingsForm(
  formData: SettingsFormData,
): SettingsFormErrors {
  const errors: SettingsFormErrors = {};

  if (!formData.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (
    formData.newPassword ||
    formData.oldPassword ||
    formData.confirmPassword
  ) {
    if (!formData.oldPassword) {
      errors.oldPassword = "Current password is required to change password";
    }

    if (!formData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
  }

  return errors;
}

// Deal

export interface DealFormData {
  dealName: string;
  dealValue: string;
  dealStatus: string;
}

export function validateDealForm(
  formData: DealFormData,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!formData.dealName.trim()) {
    errors.dealName = "Deal name is required";
  }

  if (!formData.dealValue.trim()) {
    errors.dealValue = "Deal value is required";
  } else {
    const value = parseFloat(formData.dealValue);
    if (isNaN(value) || value < 0) {
      errors.dealValue = "Deal value must be a positive number";
    }
  }

  return errors;
}

// Signup

export interface SignupFormData {
  tenantName: string;
  firstName: string;
  userEmail: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface SignupFormErrors {
  tenantName?: string;
  firstName?: string;
  userEmail?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  submit?: string;
}

export function validateSignupForm(formData: SignupFormData): SignupFormErrors {
  const errors: SignupFormErrors = {};

  if (!formData.tenantName.trim()) {
    errors.tenantName = "Organization name is required";
  }

  if (!formData.firstName.trim()) {
    errors.firstName = "Your name is required";
  }

  if (!formData.userEmail) {
    errors.userEmail = "Email is required";
  } else if (!EMAIL_REGEX.test(formData.userEmail)) {
    errors.userEmail = "Please enter a valid email";
  }

  if (!formData.password) {
    errors.password = "Password is required";
  } else if (formData.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!formData.agreeToTerms) {
    errors.agreeToTerms = "You must agree to the terms and conditions";
  }

  return errors;
}

export interface PasswordStrength {
  level: number;
  text: string;
  color: string;
}

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { level: 0, text: "", color: "bg-gray-300" };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  const levels = [
    { level: 0, text: "", color: "bg-gray-300" },
    { level: 1, text: "Weak", color: "bg-red-500" },
    { level: 2, text: "Fair", color: "bg-orange-500" },
    { level: 3, text: "Good", color: "bg-yellow-500" },
    { level: 4, text: "Strong", color: "bg-blue-500" },
    { level: 5, text: "Very Strong", color: "bg-green-500" },
  ];

  return levels[Math.min(strength, 5)];
};

// Login

export interface LoginFormData {
  userEmail: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  userEmail?: string;
  password?: string;
  submit?: string;
}

export function validateLoginForm(formData: LoginFormData): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!formData.userEmail) {
    errors.userEmail = "Email is required";
  } else if (!EMAIL_REGEX.test(formData.userEmail)) {
    errors.userEmail = "Please enter a valid email";
  }

  if (!formData.password) {
    errors.password = "Password is required";
  } else if (formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
}

// New Org (used inside Lead form)

interface NewOrgData {
  organizationName: string;
  organizationWebsite: string;
  organizationSize: number;
  organizationIndustry: string;
}

// Organization
export function validateOrganizationForm(
  formData: OrganizationFormData,
): OrgFormErrors {
  const errors: OrgFormErrors = {};

  if (!formData.organizationName.trim()) {
    errors.organizationName = "Organization name is required";
  }

  if (!formData.organizationWebsite.trim()) {
    errors.organizationWebsite = "Website is required";
  } else if (!URL_REGEX.test(formData.organizationWebsite)) {
    errors.organizationWebsite = "Please provide a valid website URL";
  }

  if (formData.organizationSize < 1 || formData.organizationSize > 10_000_000) {
    errors.organizationSize =
      "Organization size must be between 1 and 10,000,000";
  }

  if (!formData.organizationIndustry) {
    errors.organizationIndustry = "Industry is required";
  }

  // Optional fields - only validate if provided
  if (formData.city && formData.city.trim().length > 100) {
    errors.city = "City name cannot exceed 100 characters";
  }

  if (formData.country && formData.country.trim().length > 100) {
    errors.country = "Country name cannot exceed 100 characters";
  }

  return errors;
}

// User
export function validateUserForm(
  formData: UserFormData,
  context: { isExistingUser: boolean; isSuperAdmin: boolean },
): UserFormErrors {
  const errors: UserFormErrors = {};
  const { isExistingUser, isSuperAdmin } = context;

  if (!formData.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!formData.userEmail.trim()) {
    errors.userEmail = "Email is required";
  } else if (!EMAIL_REGEX.test(formData.userEmail)) {
    errors.userEmail = "Invalid email format";
  }

  if (!isExistingUser && !formData.password.trim()) {
    errors.password = "Password is required for new users";
  } else if (formData.password && formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (isSuperAdmin && !formData.tenantId) {
    errors.tenantId = "Tenant selection is required";
  }

  if (
    formData.mobile &&
    !MOBILE_REGEX.test(formData.mobile.replace(/[^0-9]/g, ""))
  ) {
    errors.mobile = "Invalid mobile number format";
  }

  return errors;
}

// Tenant
export function validateTenantForm(formData: TenantFormData): TenantFormErrors {
  const errors: TenantFormErrors = {};

  if (!formData.tenantName.trim()) {
    errors.tenantName = "Tenant name is required";
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!TENANTED_EMAIL_REGEX.test(formData.email)) {
    errors.email = "Please provide a valid email address";
  }

  if (!formData.mobile.trim()) {
    errors.mobile = "Mobile number is required";
  } else if (!MOBILE_REGEX.test(formData.mobile.replace(/[^0-9]/g, ""))) {
    errors.mobile = "Please provide a valid 10-digit mobile number";
  }

  return errors;
}

// Lead
export function validateLeadForm(
  formData: LeadFormData,
  organizationMode: "select" | "create",
  newOrgData: NewOrgData,
): LeadFormErrors {
  const errors: LeadFormErrors = {};

  if (!formData.leadFirstName.trim()) {
    errors.leadFirstName = "First name is required";
  }

  if (!formData.leadEmail.trim()) {
    errors.leadEmail = "Email is required";
  } else if (!EMAIL_REGEX.test(formData.leadEmail)) {
    errors.leadEmail = "Invalid email format";
  }

  if (organizationMode === "create") {
    if (!newOrgData.organizationName.trim()) {
      errors.organizationName = "Organization name is required";
    }

    if (!newOrgData.organizationWebsite.trim()) {
      errors.organizationWebsite = "Website is required";
    } else if (!URL_REGEX.test(newOrgData.organizationWebsite)) {
      errors.organizationWebsite = "Please provide a valid website URL";
    }

    if (
      newOrgData.organizationSize < 1 ||
      newOrgData.organizationSize > 10_000_000
    ) {
      errors.organizationSize =
        "Organization size must be between 1 and 10,000,000";
    }

    if (!newOrgData.organizationIndustry) {
      errors.organizationIndustry = "Industry is required";
    }
  }

  return errors;
}
