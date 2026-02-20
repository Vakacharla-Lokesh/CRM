import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tenant, CreateTenantDto } from "@/types/tenant";

interface TenantFormData {
  tenantName: string;
  email: string;
  mobile: string;
}

interface FormErrors {
  tenantName?: string;
  email?: string;
  mobile?: string;
}

interface TenantModalProps {
  isOpen: boolean;
  tenant: Tenant | null;
  onClose: () => void;
  onSave: (tenantData: CreateTenantDto) => Promise<void>;
}

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
    const newErrors: FormErrors = {};

    if (!formData.tenantName.trim()) {
      newErrors.tenantName = "Tenant name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Please provide a valid email address";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[1-9]\d{9}$/.test(formData.mobile.replace(/[^0-9]/g, ""))) {
      newErrors.mobile = "Please provide a valid 10-digit mobile number";
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
      const tenantData: CreateTenantDto = {
        tenantName: formData.tenantName,
        email: formData.email,
        mobile: formData.mobile.replace(/[^0-9]/g, ""), // Remove any formatting
      };

      await onSave(tenantData);
      onClose();
    } catch (error) {
      console.error("Error saving tenant:", error);
    } finally {
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
          <div className="space-y-2">
            <Label
              htmlFor="tenantName"
              className="text-sm font-semibold"
            >
              Tenant Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tenantName"
              value={formData.tenantName}
              onChange={(e) => handleInputChange("tenantName", e.target.value)}
              placeholder="Acme Corporation"
              className={errors.tenantName ? "border-red-500" : ""}
            />
            {errors.tenantName && (
              <p className="text-sm text-red-500">{errors.tenantName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-semibold"
            >
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="contact@acme.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="mobile"
              className="text-sm font-semibold"
            >
              Mobile Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              placeholder="9876543210"
              className={errors.mobile ? "border-red-500" : ""}
            />
            {errors.mobile && (
              <p className="text-sm text-red-500">{errors.mobile}</p>
            )}
          </div>

          <DialogFooter className="gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <span>{tenant ? "Update Tenant" : "Create Tenant"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TenantModal;
