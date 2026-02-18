import { useState, useCallback } from 'react';

/**
 * Form Management Hook
 * Handles form state, validation, and submission
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Submit handler function
 * @param {Function} validate - Validation function
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues = {}, onSubmit = () => {}, validate = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);

  /**
   * Handle input change
   * @param {Event|Object} e - Event or object with name and value
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target || e;
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Handle input blur
   * @param {Event} e - Blur event
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    // Validate this field if validator exists
    if (validate) {
      const fieldErrors = validate(values);
      if (fieldErrors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: fieldErrors[name],
        }));
      }
    }
  }, [values, validate]);

  /**
   * Set field value programmatically
   * @param {string} name - Field name
   * @param {*} value - Field value
   */
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /**
   * Set field error
   * @param {string} name - Field name
   * @param {string} error - Error message
   */
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  /**
   * Set field touched
   * @param {string} name - Field name
   * @param {boolean} isTouched - Touched state
   */
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched,
    }));
  }, []);

  /**
   * Validate all fields
   */
  const validateForm = useCallback(() => {
    if (!validate) {
      return true;
    }

    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    const valid = Object.keys(validationErrors).length === 0;
    setIsValid(valid);
    
    return valid;
  }, [values, validate]);

  /**
   * Handle form submit
   * @param {Event} e - Submit event
   */
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate form
    const valid = validateForm();

    if (!valid) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Submission failed',
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(true);
  }, [initialValues]);

  /**
   * Reset specific field
   * @param {string} name - Field name
   */
  const resetField = useCallback((name) => {
    setValues(prev => ({
      ...prev,
      [name]: initialValues[name],
    }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    setTouched(prev => ({
      ...prev,
      [name]: false,
    }));
  }, [initialValues]);

  /**
   * Get field props for easy spreading
   * @param {string} name - Field name
   */
  const getFieldProps = useCallback((name) => {
    return {
      name,
      value: values[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
    };
  }, [values, handleChange, handleBlur]);

  /**
   * Get field meta information
   * @param {string} name - Field name
   */
  const getFieldMeta = useCallback((name) => {
    return {
      error: errors[name],
      touched: touched[name],
      value: values[name],
    };
  }, [errors, touched, values]);

  return {
    // Values
    values,
    errors,
    touched,
    isSubmitting,
    isValid,

    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,

    // Methods
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    resetField,
    validateForm,

    // Helpers
    getFieldProps,
    getFieldMeta,
  };
};
