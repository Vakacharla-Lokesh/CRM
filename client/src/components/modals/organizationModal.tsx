import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FormField, FormSelect } from "./form-fields";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StepIndicator } from "./stepIndicator";

import type { OrganizationModalProps } from "@/types/interfaces/form-interfaces";

import { useOrganizationModalState } from "@/hooks/organizations/useOrganizationModalState";

function OrganizationModal({
  isOpen,
  organization,
  onClose,
  onSave,
  onUpdate,
}: OrganizationModalProps) {
  const {
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
  } = useOrganizationModalState({
    isOpen,
    organization,
    onClose,
    onSave,
    onUpdate,
  });

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Step 1: Basic Information
            </h3>
            <FormField
              id="name"
              label="Organization Name"
              value={formData.name}
              onChange={(value) => handleInputChange("name", value)}
              placeholder="Acme Corporation"
              required
              error={errors.name}
            />

            <FormField
              id="website"
              label="Website"
              type="url"
              value={formData.website}
              onChange={(value) => handleInputChange("website", value)}
              placeholder="https://www.acme.com"
              required
              error={errors.website}
            />

            <FormSelect
              id="industry"
              label="Industry"
              value={formData.industry}
              onChange={(value) => handleInputChange("industry", value)}
              placeholder="Select industry"
              required
              error={errors.industry}
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
              id="size"
              label="Organization Size"
              type="number"
              value={formData.size.toString()}
              onChange={(value) =>
                handleInputChange("size", parseInt(value) || 1)
              }
              placeholder="50"
              required
              error={errors.size}
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
      <DialogContent className="sm:max-w-125">
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

        <StepIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
        />

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
