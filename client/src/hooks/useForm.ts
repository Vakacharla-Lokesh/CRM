import { useState, useCallback, type SyntheticEvent } from "react";

type FormErrors<T> = Partial<Record<keyof T | "submit", string>>;
type FormTouched<T> = Partial<Record<keyof T, boolean>>;

type FormChangeEvent<T extends Record<string, any>> =
  | React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  | { name: keyof T; value: unknown; type?: string; checked?: boolean };

interface FormFieldProps<T extends Record<string, any>> {
  name: keyof T;
  value: unknown;
  onChange: (e: FormChangeEvent<T>) => void;
  onBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

interface FormFieldMeta {
  error?: string;
  touched?: boolean;
  value: unknown;
}

/**
 * Form Management Hook
 * Handles form state, validation, and submission
 *
 * @param initialValues - Initial form values
 * @param onSubmit - Submit handler function
 * @param validate - Validation function
 * @returns Form state and handlers
 */
export const useForm = <TValues extends Record<string, any>>(
  initialValues: TValues,
  onSubmit: (values: TValues) => void | Promise<void> = async () => {},
  validate: ((values: TValues) => FormErrors<TValues>) | null = null,
) => {
  const [values, setValues] = useState<TValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<TValues>>({});
  const [touched, setTouched] = useState<FormTouched<TValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);

  /**
   * Handle input change
   */
  const handleChange = useCallback(
    (e: FormChangeEvent<TValues>) => {
      const target = "target" in e ? e.target : e;
      const { name, value, type } = target;
      const checked = "checked" in target ? target.checked : undefined;

      setValues((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // Clear error for this field
      if (errors[name as keyof TValues]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name as keyof TValues];
          return newErrors;
        });
      }
    },
    [errors],
  );

  /**
   * Handle input blur
   */
  const handleBlur = useCallback(
    (
      e: React.FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name } = e.target;

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate this field if validator exists
      if (validate) {
        const fieldErrors = validate(values);
        if (fieldErrors[name as keyof TValues]) {
          setErrors((prev) => ({
            ...prev,
            [name]: fieldErrors[name as keyof TValues],
          }));
        }
      }
    },
    [values, validate],
  );

  /**
   * Set field value programmatically
   */
  const setFieldValue = useCallback((name: keyof TValues, value: unknown) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /**
   * Set field error
   */
  const setFieldError = useCallback(
    (name: keyof TValues | "submit", error: string) => {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [],
  );

  /**
   * Set field touched
   */
  const setFieldTouched = useCallback(
    (name: keyof TValues, isTouched = true) => {
      setTouched((prev) => ({
        ...prev,
        [name]: isTouched,
      }));
    },
    [],
  );

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
   */
  const handleSubmit = useCallback(
    async (e?: SyntheticEvent<HTMLFormElement>) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof TValues] = true;
        return acc;
      }, {} as FormTouched<TValues>);
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
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("Form submission error:", err);
        setErrors((prev) => ({
          ...prev,
          submit: err.message || "Submission failed",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit],
  );

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
   */
  const resetField = useCallback(
    (name: keyof TValues) => {
      setValues((prev) => ({
        ...prev,
        [name]: initialValues[name],
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      setTouched((prev) => ({
        ...prev,
        [name]: false,
      }));
    },
    [initialValues],
  );

  /**
   * Get field props for easy spreading
   */
  const getFieldProps = useCallback(
    (name: keyof TValues): FormFieldProps<TValues> => {
      return {
        name,
        value: values[name] ?? "",
        onChange: handleChange,
        onBlur: handleBlur,
      };
    },
    [values, handleChange, handleBlur],
  );

  /**
   * Get field meta information
   */
  const getFieldMeta = useCallback(
    (name: keyof TValues): FormFieldMeta<TValues> => {
      return {
        error: errors[name],
        touched: touched[name],
        value: values[name],
      };
    },
    [errors, touched, values],
  );

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
