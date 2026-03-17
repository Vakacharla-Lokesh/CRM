import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CreateTenantDto } from "@/types/tenant";
import { FormField } from "./form-fields";
import { ModalFooter } from "./shared";

import type {
  TenantFormData,
  TenantFormErrors as FormErrors,
  TenantModalProps,
} from "@/types/interfaces/form-interfaces";
import { validateTenantForm } from "@/utils/formValidators";

function TenantModal({ isOpen, tenant, onClose, onSave }: TenantModalProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    name: tenant?.name || "",
    email: tenant?.email || "",
    mobile: tenant?.mobile || "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize/reset form data when modal opens or tenant changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: tenant?.name ?? "",
        email: tenant?.email ?? "",
        mobile: tenant?.mobile ?? "",
      });
      setErrors({});
    }
  }, [isOpen, tenant]);

  const validateForm = (): boolean => {
    const newErrors = validateTenantForm(formData);
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
      const tenantData: CreateTenantDto = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile.replace(/[^0-9]/g, ""),
      };

      await onSave(tenantData);
      onClose();
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error saving tenant:", error);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TenantFormData, value: string) => {
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
            {tenant ? "Edit Tenant" : "Add New Tenant"}
          </DialogTitle>
          <DialogDescription>
            {tenant
              ? "Update the tenant information below."
              : "Fill in the details to create a new tenant organization."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 py-4"
        >
          <FormField
            id="name"
            label="Tenant Name"
            value={formData.name}
            onChange={(value) => handleInputChange("name", value)}
            placeholder="Acme Corporation"
            required
            error={errors.name}
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange("email", value)}
            placeholder="contact@acme.com"
            required
            error={errors.email}
          />

          <FormField
            id="mobile"
            label="Mobile Number"
            type="tel"
            value={formData.mobile}
            onChange={(value) => handleInputChange("mobile", value)}
            placeholder="9876543210"
            required
            error={errors.mobile}
          />

          <ModalFooter
            onCancel={onClose}
            isSubmitting={isSubmitting}
            submitLabel={tenant ? "Update Tenant" : "Create Tenant"}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TenantModal;
