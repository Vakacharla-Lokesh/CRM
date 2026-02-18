/**
 * Validation Utilities
 * Common validation functions for forms and data
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength and requirements
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    strength: 'weak',
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

  const metRequirements = Object.values(result.requirements).filter(Boolean).length;

  if (metRequirements >= 5) {
    result.strength = 'strong';
    result.isValid = true;
  } else if (metRequirements >= 3) {
    result.strength = 'medium';
    result.isValid = true;
  } else {
    result.strength = 'weak';
    result.isValid = false;
  }

  return result;
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  // Simple validation - accepts various formats
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  const digits = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digits.length >= 10 && digits.length <= 15;
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid
 */
export const isValidURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate required field
 * @param {*} value - Value to validate
 * @returns {boolean} Is valid
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @returns {boolean} Is valid
 */
export const minLength = (value, minLength) => {
  if (!value) return false;
  return value.length >= minLength;
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length
 * @returns {boolean} Is valid
 */
export const maxLength = (value, maxLength) => {
  if (!value) return true;
  return value.length <= maxLength;
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} Is valid
 */
export const inRange = (value, min, max) => {
  const num = Number(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
};

/**
 * Validate form data
 * @param {Object} data - Form data
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation errors
 */
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !isRequired(value)) {
      errors[field] = fieldRules.message || `${field} is required`;
      return;
    }

    if (fieldRules.email && !isValidEmail(value)) {
      errors[field] = fieldRules.message || 'Invalid email address';
      return;
    }

    if (fieldRules.phone && !isValidPhone(value)) {
      errors[field] = fieldRules.message || 'Invalid phone number';
      return;
    }

    if (fieldRules.url && !isValidURL(value)) {
      errors[field] = fieldRules.message || 'Invalid URL';
      return;
    }

    if (fieldRules.minLength && !minLength(value, fieldRules.minLength)) {
      errors[field] = fieldRules.message || `Minimum length is ${fieldRules.minLength}`;
      return;
    }

    if (fieldRules.maxLength && !maxLength(value, fieldRules.maxLength)) {
      errors[field] = fieldRules.message || `Maximum length is ${fieldRules.maxLength}`;
      return;
    }

    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.message || 'Invalid format';
      return;
    }

    if (fieldRules.custom && !fieldRules.custom(value, data)) {
      errors[field] = fieldRules.message || 'Invalid value';
      return;
    }
  });

  return errors;
};
