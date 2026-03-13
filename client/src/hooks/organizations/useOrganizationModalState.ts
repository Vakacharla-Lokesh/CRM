/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import type {
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  OrganizationIndustry,
} from "@/types";

import type {
  OrganizationFormData,
  FormErrors,
  OrganizationModalProps,
} from "@/types/interfaces/form-interfaces";
import { ORGANIZATION_INDUSTRIES } from "@/types/interfaces/form-interfaces";
import { mapToSelectOptions } from "@/components/modals/map-options/mapOrganizationOptions";
import { useAppContext } from "@/hooks";
import { validateOrganizationForm } from "@/utils/formValidators";
import { useOffline } from "@/context/useOffline";
import { toast } from "sonner";

export function useOrganizationModalState({
  isOpen,
  organization,
  onClose,
  onSave,
  onUpdate,
}: OrganizationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: "",
    website: "",
    size: 10,
    industry: "Software",
    city: "",
    country: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const industryOptions = mapToSelectOptions(ORGANIZATION_INDUSTRIES);

  const { user } = useAppContext();
  const { isOnline, addToQueue } = useOffline();

  const totalSteps = 2;

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        website: organization.website || "",
        size:
          typeof organization.size === "string"
            ? parseInt(organization.size)
            : organization.size || 10,
        industry: organization.industry,
        city: organization.city || "",
        country: organization.country || "",
      });
    } else {
      setFormData({
        name: "",
        website: "",
        size: 10,
        industry: "Software",
        city: "",
        country: "",
      });
    }
    setErrors({});
    setCurrentStep(0);
  }, [organization, isOpen]);

  const handleInputChange = (
    field: keyof OrganizationFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors: FormErrors = {};

    if (currentStep === 0) {
      // Step 1: Basic Information
      if (!formData.name.trim()) {
        stepErrors.name = "Organization name is required";
      }

      if (!formData.website.trim()) {
        stepErrors.website = "Website is required";
      } else if (!/^(ftp|http|https):\/\/[^ "]+$/.test(formData.website)) {
        stepErrors.website = "Please provide a valid website URL";
      }

      if (!formData.industry) {
        stepErrors.industry = "Industry is required";
      }
    } else if (currentStep === 1) {
      // Step 2: Company Details
      if (formData.size < 1 || formData.size > 10_000_000) {
        stepErrors.size = "Organization size must be between 1 and 10,000,000";
      }

      // City and country are optional, but validate length if provided
      if (formData.city && formData.city.trim().length > 100) {
        stepErrors.city = "City name cannot exceed 100 characters";
      }

      if (formData.country && formData.country.trim().length > 100) {
        stepErrors.country = "Country name cannot exceed 100 characters";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setErrors({});
  };

  const handleSubmit = async () => {
    // Guard: if not on the final step, advance instead of submitting
    if (currentStep < totalSteps - 1) {
      handleNext();
      return;
    }

    // Final validation
    const allErrors = validateOrganizationForm(formData);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setIsSubmitting(true);

    // --- Offline path ---
    if (!isOnline) {
      if (organization && onUpdate) {
        const updateData = {
          id: organization._id,
          name: formData.name,
          website: formData.website,
          size: formData.size,
          industry: formData.industry as OrganizationIndustry,
          city: formData.city || undefined,
          country: formData.country || undefined,
        };
        addToQueue(
          "/api/organizations",
          "PUT",
          updateData,
          undefined,
          3,
          "organizations",
          "update",
        );
        toast.info(
          "You're offline. Organization update has been queued and will sync when your connection is restored.",
        );
      } else {
        const createData: CreateOrganizationDTO = {
          name: formData.name,
          website: formData.website,
          size: formData.size,
          industry: formData.industry as OrganizationIndustry,
          tenantId: user?.tenantId || "tenant-1",
          city: formData.city || undefined,
          country: formData.country || undefined,
        };
        addToQueue(
          "/api/organizations",
          "POST",
          createData,
          undefined,
          3,
          "organizations",
          "create",
        );
        toast.info(
          "You're offline. Organization has been queued and will sync automatically when your connection is restored.",
        );
      }
      setIsSubmitting(false);
      onClose();
      return;
    }

    // --- Online path ---
    try {
      if (organization && onUpdate) {
        const updateData: UpdateOrganizationDTO = {
          name: formData.name,
          website: formData.website,
          size: formData.size,
          industry: formData.industry as OrganizationIndustry,
          city: formData.city || undefined,
          country: formData.country || undefined,
        };
        await onUpdate(organization._id, updateData);
      } else {
        const createData: CreateOrganizationDTO = {
          name: formData.name,
          website: formData.website,
          size: formData.size,
          industry: formData.industry as OrganizationIndustry,
          tenantId: user?.tenantId || "tenant-1",
          city: formData.city || undefined,
          country: formData.country || undefined,
        };
        await onSave(createData);
      }
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Failed to save organization:", error);
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    formData,
    errors,
    isSubmitting,
    industryOptions,
    handleInputChange,
    handleNext,
    handleBack,
    handleSubmit,
    totalSteps,
  };
}
