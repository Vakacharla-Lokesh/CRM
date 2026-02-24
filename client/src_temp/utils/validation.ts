import type { ValidationRules, ValidationErrors } from "../types";

interface PasswordValidationResult {
  isValid: boolean;
  strength: "weak" | "medium" | "strong";
  requirements: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export const isValidEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string | null | undefined,
): PasswordValidationResult => {
  const result: PasswordValidationResult = {
    isValid: false,
    strength: "weak",
    requirements: {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
    },
  };

  if (!password) return result;

  result.requirements.minLength = password.length >= 8;
  result.requirements.hasUpperCase = /[A-Z]/.test(password);
  result.requirements.hasLowerCase = /[a-z]/.test(password);
  result.requirements.hasNumber = /\d/.test(password);
  result.requirements.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const metRequirements = Object.values(result.requirements).filter(
    Boolean,
  ).length;

  if (metRequirements >= 5) {
    result.strength = "strong";
    result.isValid = true;
  } else if (metRequirements >= 3) {
    result.strength = "medium";
    result.isValid = true;
  } else {
    result.strength = "weak";
    result.isValid = false;
  }

  return result;
};

export const isValidPhone = (phone: string | null | undefined): boolean => {
  if (!phone) return false;
  const phoneRegex = /^[\d\s\-+()]+$/;
  const digits = phone.replace(/\D/g, "");
  return phoneRegex.test(phone) && digits.length >= 10 && digits.length <= 15;
};

export const isValidURL = (url: string | null | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const minLength = (
  value: string | null | undefined,
  min: number,
): boolean => {
  if (!value) return false;
  return value.length >= min;
};

export const maxLength = (
  value: string | null | undefined,
  max: number,
): boolean => {
  if (!value) return true;
  return value.length <= max;
};

export const inRange = (
  value: number | string | null | undefined,
  min: number,
  max: number,
): boolean => {
  const num = Number(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
};

export const validateForm = (
  data: Record<string, unknown>,
  rules: ValidationRules,
): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((field) => {
    const value = data[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !isRequired(value)) {
      errors[field] = fieldRules.message || `${field} is required`;
      return;
    }

    if (fieldRules.email && !isValidEmail(value as string)) {
      errors[field] = fieldRules.message || "Invalid email address";
      return;
    }

    if (fieldRules.phone && !isValidPhone(value as string)) {
      errors[field] = fieldRules.message || "Invalid phone number";
      return;
    }

    if (fieldRules.url && !isValidURL(value as string)) {
      errors[field] = fieldRules.message || "Invalid URL";
      return;
    }

    if (
      fieldRules.minLength &&
      !minLength(value as string, fieldRules.minLength)
    ) {
      errors[field] =
        fieldRules.message || `Minimum length is ${fieldRules.minLength}`;
      return;
    }

    if (
      fieldRules.maxLength &&
      !maxLength(value as string, fieldRules.maxLength)
    ) {
      errors[field] =
        fieldRules.message || `Maximum length is ${fieldRules.maxLength}`;
      return;
    }

    if (fieldRules.pattern && !fieldRules.pattern.test(value as string)) {
      errors[field] = fieldRules.message || "Invalid format";
      return;
    }

    if (fieldRules.custom && !fieldRules.custom(value)) {
      errors[field] = fieldRules.message || "Invalid value";
      return;
    }
  });

  return errors;
};
