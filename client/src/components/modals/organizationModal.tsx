import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CreateOrganizationDTO, UpdateOrganizationDTO } from "@/types";
import { FormField, FormSelect } from "./form-fields";
import { ModalFooter } from "./shared";

import type {
  OrganizationFormData,
  FormErrors,
  OrganizationModalProps,
} from "@/types/form-interfaces/";
import { ORGANIZATION_INDUSTRIES } from "@/types/form-interfaces";
import { mapToSelectOptions } from "@/components/modals/map-options/mapOrganizationOptions";

function OrganizationModal({
  isOpen,
  organization,
  onClose,
  onSave,
  onUpdate,
}: OrganizationModalProps) {
  const [formData, setFormData] = useState<OrganizationFormData>({
    organizationName: "",
    organizationWebsite: "",
    organizationSize: 10,
    organizationIndustry: "Software",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const industryOptions = mapToSelectOptions(ORGANIZATION_INDUSTRIES);

  useEffect(() => {
    if (organization) {
      setFormData({
        organizationName: organization.organizationName,
        organizationWebsite: organization.organizationWebsite || "",
        organizationSize:
          typeof organization.organizationSize === "string"
            ? 10
            : organization.organizationSize || 10,
        organizationIndustry: organization.organizationIndustry,
      });
    } else {
      setFormData({
        organizationName: "",
        organizationWebsite: "",
        organizationSize: 10,
        organizationIndustry: "Software",
      });
    }
    setErrors({});
  }, [organization, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }

    if (!formData.organizationWebsite.trim()) {
      newErrors.organizationWebsite = "Website is required";
    } else if (
      !/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!/-]))?$/.test(
        formData.organizationWebsite,
      )
    ) {
      newErrors.organizationWebsite = "Please provide a valid website URL";
    }

    if (formData.organizationSize < 1 || formData.organizationSize > 10000000) {
      newErrors.organizationSize =
        "Organization size must be between 1 and 10,000,000";
    }

    if (!formData.organizationIndustry) {
      newErrors.organizationIndustry = "Industry is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (organization && onUpdate) {
        // Edit mode - call onUpdate (no tenantId needed)
        const updateData: UpdateOrganizationDTO = {
          organizationName: formData.organizationName,
          organizationWebsite: formData.organizationWebsite,
          organizationSize: formData.organizationSize,
          organizationIndustry: formData.organizationIndustry,
        };
        await onUpdate(organization._id, updateData);
      } else {
        // Create mode - call onSave
        const createData: CreateOrganizationDTO = {
          organizationName: formData.organizationName,
          organizationWebsite: formData.organizationWebsite,
          organizationSize: formData.organizationSize,
          organizationIndustry: formData.organizationIndustry,
          tenantId: "",
        };
        await onSave(createData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving organization:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof OrganizationFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {organization ? "Edit Organization" : "Add New Organization"}
          </DialogTitle>
          <DialogDescription>
            {organization
              ? "Update the organization information below."
              : "Fill in the details to create a new organization."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 py-4"
        >
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <ModalFooter
            onCancel={onClose}
            isSubmitting={isSubmitting}
            submitLabel={
              organization ? "Update Organization" : "Create Organization"
            }
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default OrganizationModal;
