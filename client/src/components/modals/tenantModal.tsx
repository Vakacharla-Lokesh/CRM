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
    tenantName: "",
    email: "",
    mobile: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFormData({
        tenantName: tenant.tenantName,
        email: tenant.email,
        mobile: tenant.mobile,
      });
    } else {
      setFormData({
        tenantName: "",
        email: "",
        mobile: "",
      });
    }
    setErrors({});
  }, [tenant, isOpen]);

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
        tenantName: formData.tenantName,
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
            id="tenantName"
            label="Tenant Name"
            value={formData.tenantName}
            onChange={(value) => handleInputChange("tenantName", value)}
            placeholder="Acme Corporation"
            required
            error={errors.tenantName}
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
