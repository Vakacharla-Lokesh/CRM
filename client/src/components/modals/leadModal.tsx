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
import type { CreateLeadDTO } from "@/types";
import type {
  FormErrors,
  LeadFormData,
  LeadModalProps,
} from "@/types/form-interfaces/leadForm.interfaces";

function LeadModal({ isOpen, lead, onClose, onSave }: LeadModalProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    leadFirstName: "",
    leadLastName: "",
    leadEmail: "",
    leadSource: "API",
    leadStatus: "New",
    leadScore: 0,
    organizationId: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        leadFirstName: lead.leadFirstName,
        leadLastName: lead.leadLastName || "",
        leadEmail: lead.leadEmail,
        leadSource: lead.leadSource,
        leadStatus: lead.leadStatus,
        leadScore: lead.leadScore,
        organizationId: lead.organizationId || "",
        notes: "",
      });
    } else {
      setFormData({
        leadFirstName: "",
        leadLastName: "",
        leadEmail: "",
        leadSource: "API",
        leadStatus: "New",
        leadScore: 0,
        organizationId: "",
        notes: "",
      });
    }
    setErrors({});
  }, [lead, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.leadFirstName.trim()) {
      newErrors.leadFirstName = "First name is required";
    }

    if (!formData.leadEmail.trim()) {
      newErrors.leadEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.leadEmail)) {
      newErrors.leadEmail = "Invalid email format";
    }

    if (formData.leadScore < 0 || formData.leadScore > 100) {
      newErrors.leadScore = "Score must be between 0 and 100";
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
      const leadData: CreateLeadDTO = {
        leadFirstName: formData.leadFirstName,
        leadLastName: formData.leadLastName || undefined,
        leadEmail: formData.leadEmail,
        leadSource: formData.leadSource,
        leadStatus: formData.leadStatus,
        leadScore: formData.leadScore,
        organizationId: formData.organizationId || undefined,
        tenantId: "tenant-1", //must use actual tenant ID in real implementation
      };

      await onSave(leadData);
      onClose();
    } catch (error) {
      console.error("Error saving lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof LeadFormData,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {lead ? "Edit Lead" : "Add New Lead"}
          </DialogTitle>
          <DialogDescription>
            {lead
              ? "Update the lead information below."
              : "Fill in the details to create a new lead."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 py-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="leadFirstName"
                className="text-sm font-semibold"
              >
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="leadFirstName"
                value={formData.leadFirstName}
                onChange={(e) =>
                  handleInputChange("leadFirstName", e.target.value)
                }
                placeholder="John"
                className={errors.leadFirstName ? "border-red-500" : ""}
              />
              {errors.leadFirstName && (
                <p className="text-sm text-red-500">{errors.leadFirstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="leadLastName"
                className="text-sm font-semibold"
              >
                Last Name
              </Label>
              <Input
                id="leadLastName"
                value={formData.leadLastName}
                onChange={(e) =>
                  handleInputChange("leadLastName", e.target.value)
                }
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="leadEmail"
              className="text-sm font-semibold"
            >
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="leadEmail"
              type="email"
              value={formData.leadEmail}
              onChange={(e) => handleInputChange("leadEmail", e.target.value)}
              placeholder="john.doe@example.com"
              className={errors.leadEmail ? "border-red-500" : ""}
            />
            {errors.leadEmail && (
              <p className="text-sm text-red-500">{errors.leadEmail}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="leadSource"
                className="text-sm font-semibold"
              >
                Lead Source
              </Label>
              <Select
                value={formData.leadSource}
                onValueChange={(value) =>
                  handleInputChange("leadSource", value)
                }
              >
                <SelectTrigger id="leadSource">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="API">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>API</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Outsource">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span>Outsource</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="leadStatus"
                className="text-sm font-semibold"
              >
                Lead Status
              </Label>
              <Select
                value={formData.leadStatus}
                onValueChange={(value) =>
                  handleInputChange("leadStatus", value)
                }
              >
                <SelectTrigger id="leadStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>New</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Follow-Up">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span>Follow-Up</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Converted">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Converted</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Dead">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>Dead</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="leadScore"
                className="text-sm font-semibold"
              >
                Lead Score (0-100)
              </Label>
              <Input
                id="leadScore"
                type="number"
                min="0"
                max="100"
                value={formData.leadScore}
                onChange={(e) =>
                  handleInputChange("leadScore", parseInt(e.target.value) || 0)
                }
                placeholder="50"
                className={errors.leadScore ? "border-red-500" : ""}
              />
              {errors.leadScore && (
                <p className="text-sm text-red-500">{errors.leadScore}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="organizationId"
                className="text-sm font-semibold"
              >
                Organization ID
              </Label>
              <Input
                id="organizationId"
                value={formData.organizationId}
                onChange={(e) =>
                  handleInputChange("organizationId", e.target.value)
                }
                placeholder="org-123"
              />
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
                <span>{lead ? "Update Lead" : "Create Lead"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LeadModal;
