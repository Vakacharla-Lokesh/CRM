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
import { ModalFooter } from "./shared";

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
  const [formData, setFormData] = useState<OrganizationFormData>({
    organizationName: "",
    organizationWebsite: "",
    organizationSize: 10,
    organizationIndustry: "Software",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const industryOptions = mapToSelectOptions(ORGANIZATION_INDUSTRIES);

  const { user } = useAppContext();
  const { isOnline, addToQueue } = useOffline();

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
    const newErrors = validateOrganizationForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // --- Offline path ---
    if (!isOnline) {
      if (organization && onUpdate) {
        // Update needs to go through bulk/update endpoint with id in payload
        const updateData = {
          id: organization._id,
          organizationName: formData.organizationName,
          organizationWebsite: formData.organizationWebsite,
          organizationSize: formData.organizationSize,
          organizationIndustry:
            formData.organizationIndustry as OrganizationIndustry,
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
      onClose();
      setIsSubmitting(false);
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
        };
        await onSave(createData);
      }
      onClose();
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error saving organization:", error);
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
