/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  OrganizationIndustry,
} from "@/types";
import { FormField, FormSelect } from "./form-fields";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

function OrganizationModal({
  isOpen,
  organization,
  onClose,
  onSave,
  onUpdate,
}: OrganizationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OrganizationFormData>({
    organizationName: "",
    organizationWebsite: "",
    organizationSize: 10,
    organizationIndustry: "Software",
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
        organizationName: organization.organizationName,
        organizationWebsite: organization.organizationWebsite || "",
        organizationSize:
          typeof organization.organizationSize === "string"
            ? parseInt(organization.organizationSize)
            : organization.organizationSize || 10,
        organizationIndustry: organization.organizationIndustry,
        city: organization.city || "",
        country: organization.country || "",
      });
    } else {
      setFormData({
        organizationName: "",
        organizationWebsite: "",
        organizationSize: 10,
        organizationIndustry: "Software",
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
      if (!formData.organizationName.trim()) {
        stepErrors.organizationName = "Organization name is required";
      }

      if (!formData.organizationWebsite.trim()) {
        stepErrors.organizationWebsite = "Website is required";
      } else if (
        !/^(ftp|http|https):\/\/[^ "]+$/.test(formData.organizationWebsite)
      ) {
        stepErrors.organizationWebsite = "Please provide a valid website URL";
      }

      if (!formData.organizationIndustry) {
        stepErrors.organizationIndustry = "Industry is required";
      }
    } else if (currentStep === 1) {
      // Step 2: Company Details
      if (
        formData.organizationSize < 1 ||
        formData.organizationSize > 10_000_000
      ) {
        stepErrors.organizationSize =
          "Organization size must be between 1 and 10,000,000";
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
          organizationName: formData.organizationName,
          organizationWebsite: formData.organizationWebsite,
          organizationSize: formData.organizationSize,
          organizationIndustry:
            formData.organizationIndustry as OrganizationIndustry,
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
          organizationName: formData.organizationName,
          organizationWebsite: formData.organizationWebsite,
          organizationSize: formData.organizationSize,
          organizationIndustry:
            formData.organizationIndustry as OrganizationIndustry,
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
          organizationName: formData.organizationName,
          organizationWebsite: formData.organizationWebsite,
          organizationSize: formData.organizationSize,
          organizationIndustry:
            formData.organizationIndustry as OrganizationIndustry,
          city: formData.city || undefined,
          country: formData.country || undefined,
        };
        await onUpdate(organization._id, updateData);
      } else {
        const createData: CreateOrganizationDTO = {
          organizationName: formData.organizationName,
          organizationWebsite: formData.organizationWebsite,
          organizationSize: formData.organizationSize,
          organizationIndustry:
            formData.organizationIndustry as OrganizationIndustry,
          tenantId: user?.tenantId || "tenant-1",
          city: formData.city || undefined,
          country: formData.country || undefined,
        };
        await onSave(createData);
      }
    } catch (error) {
      console.error("Failed to save organization:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentStep
                ? "w-8 bg-blue-600"
                : index < currentStep
                  ? "w-2 bg-blue-400"
                  : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Step 1: Basic Information
            </h3>
            <FormField
              id="organizationName"
              label="Organization Name"
              value={formData.organizationName}
              onChange={(value) => handleInputChange("organizationName", value)}
              placeholder="Acme Corporation"
              required
              error={errors.organizationName}
            />

            <FormField
              id="organizationWebsite"
              label="Website"
              type="url"
              value={formData.organizationWebsite}
              onChange={(value) =>
                handleInputChange("organizationWebsite", value)
              }
              placeholder="https://www.acme.com"
              required
              error={errors.organizationWebsite}
            />

            <FormSelect
              id="organizationIndustry"
              label="Industry"
              value={formData.organizationIndustry}
              onChange={(value) =>
                handleInputChange("organizationIndustry", value)
              }
              placeholder="Select industry"
              required
              error={errors.organizationIndustry}
              options={industryOptions}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Step 2: Company Details
            </h3>
            <FormField
              id="organizationSize"
              label="Organization Size"
              type="number"
              value={formData.organizationSize.toString()}
              onChange={(value) =>
                handleInputChange("organizationSize", parseInt(value) || 1)
              }
              placeholder="50"
              required
              error={errors.organizationSize}
              min={1}
              max={10000000}
            />

            <FormField
              id="city"
              label="City"
              value={formData.city}
              onChange={(value) => handleInputChange("city", value)}
              placeholder="San Francisco"
              error={errors.city}
            />

            <FormField
              id="country"
              label="Country"
              value={formData.country}
              onChange={(value) => handleInputChange("country", value)}
              placeholder="United States"
              error={errors.country}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {organization ? "Edit Organization" : "Add New Organization"}
          </DialogTitle>
          <DialogDescription>
            {organization
              ? "Update the organization information below."
              : "Fill in the details to create a new organization."}
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 py-4"
        >
          {renderStep()}

          <div className="flex items-center justify-between gap-4 pt-4">
            {currentStep > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}

            {currentStep < totalSteps - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : organization
                    ? "Update Organization"
                    : "Create Organization"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default OrganizationModal;
