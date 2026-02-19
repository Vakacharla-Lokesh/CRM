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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Organization,
  CreateOrganizationDTO,
  OrganizationSize,
} from "@/types";

interface OrganizationFormData {
  organizationName: string;
  organizationWebsite: string;
  organizationSize: number;
  organizationIndustry: string;
}

interface FormErrors {
  organizationName?: string;
  organizationWebsite?: string;
  organizationSize?: string;
  organizationIndustry?: string;
}

interface OrganizationModalProps {
  isOpen: boolean;
  organization: Organization | null;
  onClose: () => void;
  onSave: (organizationData: CreateOrganizationDTO) => Promise<void>;
}

function OrganizationModal({
  isOpen,
  organization,
  onClose,
  onSave,
}: OrganizationModalProps) {
  const [formData, setFormData] = useState<OrganizationFormData>({
    organizationName: "",
    organizationWebsite: "",
    organizationSize: 10,
    organizationIndustry: "Software",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const organizationData: CreateOrganizationDTO = {
        organizationName: formData.organizationName,
        organizationWebsite: formData.organizationWebsite,
        organizationSize: getOrganizationSizeCategory(
          formData.organizationSize,
        ),
        organizationIndustry: formData.organizationIndustry,
        tenantId: "",
      };

      await onSave(organizationData);
      onClose();
    } catch (error) {
      console.error("Error saving organization:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOrganizationSizeCategory = (size: number): OrganizationSize => {
    if (size <= 10) return "1-10";
    if (size <= 50) return "11-50";
    if (size <= 200) return "51-200";
    if (size <= 500) return "201-500";
    if (size <= 1000) return "501-1000";
    return "1000+";
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
          <div className="space-y-2">
            <Label
              htmlFor="organizationName"
              className="text-sm font-semibold"
            >
              Organization Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="organizationName"
              value={formData.organizationName}
              onChange={(e) =>
                handleInputChange("organizationName", e.target.value)
              }
              placeholder="Acme Corporation"
              className={errors.organizationName ? "border-red-500" : ""}
            />
            {errors.organizationName && (
              <p className="text-sm text-red-500">{errors.organizationName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="organizationWebsite"
              className="text-sm font-semibold"
            >
              Website <span className="text-red-500">*</span>
            </Label>
            <Input
              id="organizationWebsite"
              type="url"
              value={formData.organizationWebsite}
              onChange={(e) =>
                handleInputChange("organizationWebsite", e.target.value)
              }
              placeholder="https://www.acme.com"
              className={errors.organizationWebsite ? "border-red-500" : ""}
            />
            {errors.organizationWebsite && (
              <p className="text-sm text-red-500">
                {errors.organizationWebsite}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="organizationSize"
                className="text-sm font-semibold"
              >
                Organization Size <span className="text-red-500">*</span>
              </Label>
              <Input
                id="organizationSize"
                type="number"
                min="1"
                max="10000000"
                value={formData.organizationSize}
                onChange={(e) =>
                  handleInputChange(
                    "organizationSize",
                    parseInt(e.target.value) || 1,
                  )
                }
                placeholder="50"
                className={errors.organizationSize ? "border-red-500" : ""}
              />
              {errors.organizationSize && (
                <p className="text-sm text-red-500">
                  {errors.organizationSize}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="organizationIndustry"
                className="text-sm font-semibold"
              >
                Industry <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.organizationIndustry}
                onValueChange={(value) =>
                  handleInputChange("organizationIndustry", value)
                }
              >
                <SelectTrigger
                  id="organizationIndustry"
                  className={
                    errors.organizationIndustry ? "border-red-500" : ""
                  }
                >
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Software">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Software</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Textile">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span>Textile</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Foods">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Foods</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Others">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      <span>Others</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.organizationIndustry && (
                <p className="text-sm text-red-500">
                  {errors.organizationIndustry}
                </p>
              )}
            </div>
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
                <span>
                  {organization ? "Update Organization" : "Create Organization"}
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default OrganizationModal;
