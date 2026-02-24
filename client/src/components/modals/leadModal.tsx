/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { CreateLeadDTO, CreateOrganizationDTO, OrganizationIndustry } from "@/types";
import type {
  FormErrors,
  LeadFormData,
  LeadModalProps,
} from "@/types/interfaces/form-interfaces/lead.form.interfaces";
import { useOrganizationData } from "@/hooks";
import { organizationService } from "@/services";
import { FormField, FormSelect } from "./form-fields";
import { ErrorAlert, ModalFooter } from "./shared";
import { OrganizationSection } from "./sections";

import { LEAD_SOURCES, LEAD_STATUSES } from "@/types/interfaces/form-interfaces";
import { mapToSelectOptions } from "@/components/modals/map-options/mapSelectLeadOptions";
import { useAppContext } from "@/hooks";
import { validateLeadForm } from "@/utils/formValidators";

function LeadModal({ isOpen, lead, onClose, onSave }: LeadModalProps) {
  const { organizations, fetchOrganizations } = useOrganizationData();

  const { user } = useAppContext();

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
  const [organizationMode, setOrganizationMode] = useState<"select" | "create">(
    "select",
  );
  const [newOrgData, setNewOrgData] = useState({
    organizationName: "",
    organizationWebsite: "",
    organizationSize: 10,
    organizationIndustry: "Software",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const leadSourceOptions = mapToSelectOptions(LEAD_SOURCES);
  const leadStatusOptions = mapToSelectOptions(LEAD_STATUSES);

  useEffect(() => {
    if (isOpen) {
      fetchOrganizations();
    }
  }, [isOpen, fetchOrganizations]);

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
      if (lead.organizationId) {
        setOrganizationMode("select");
      }
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
      setOrganizationMode("select");
      setNewOrgData({
        organizationName: "",
        organizationWebsite: "",
        organizationSize: 10,
        organizationIndustry: "Software",
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [lead, isOpen]);

  const validateForm = (): boolean => {
    const newErrors = validateLeadForm(formData, organizationMode, newOrgData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let organizationId = formData.organizationId;

      if (organizationMode === "create") {
        const organizationData: CreateOrganizationDTO = {
          organizationName: newOrgData.organizationName,
          organizationWebsite: newOrgData.organizationWebsite,
          organizationSize: newOrgData.organizationSize,
          organizationIndustry: newOrgData.organizationIndustry as OrganizationIndustry,
          tenantId: user?.tenantId || "tenant-1",
        };

        const newOrg =
          await organizationService.createOrganization(organizationData);
        organizationId = newOrg._id;
      }

      const leadData: CreateLeadDTO = {
        leadFirstName: formData.leadFirstName,
        leadLastName: formData.leadLastName || undefined,
        leadEmail: formData.leadEmail,
        leadSource: formData.leadSource,
        leadStatus: formData.leadStatus,
        organizationId: organizationId || undefined,
        tenantId: user?.tenantId || "tenant-1",
      };

      await onSave(leadData);
      onClose();
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error saving lead:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save lead. Please try again.";
      setSubmitError(errorMessage);
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

  const handleOrgInputChange = (
    field: keyof typeof newOrgData,
    value: string | number,
  ) => {
    setNewOrgData((prev) => ({
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
      <DialogContent className="sm:max-w-150 max-h-[90vh] flex flex-col p-0">
        <div className="px-6 pt-6">
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
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="overflow-y-auto px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id="leadFirstName"
                label="First Name"
                value={formData.leadFirstName}
                onChange={(value) => handleInputChange("leadFirstName", value)}
                placeholder="John"
                required
                error={errors.leadFirstName}
              />

              <FormField
                id="leadLastName"
                label="Last Name"
                value={formData.leadLastName}
                onChange={(value) => handleInputChange("leadLastName", value)}
                placeholder="Doe"
              />
            </div>

            <FormField
              id="leadEmail"
              label="Email"
              type="email"
              value={formData.leadEmail}
              onChange={(value) => handleInputChange("leadEmail", value)}
              placeholder="john.doe@example.com"
              required
              error={errors.leadEmail}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                id="leadSource"
                label="Lead Source"
                value={formData.leadSource}
                onChange={(value) => handleInputChange("leadSource", value)}
                placeholder="Select source"
                options={leadSourceOptions}
              />

              <FormSelect
                id="leadStatus"
                label="Lead Status"
                value={formData.leadStatus}
                onChange={(value) => handleInputChange("leadStatus", value)}
                placeholder="Select status"
                options={leadStatusOptions}
              />
            </div>

            {lead && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Lead Score (Managed by System)
                </Label>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                        style={{ width: `${formData.leadScore}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 min-w-12 text-right">
                    {formData.leadScore}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Lead score is automatically calculated based on engagement and
                  other factors.
                </p>
              </div>
            )}

            <OrganizationSection
              organizations={organizations}
              selectedOrgId={formData.organizationId}
              onOrgSelect={(orgId: string) =>
                handleInputChange("organizationId", orgId)
              }
              newOrgData={newOrgData}
              onNewOrgChange={handleOrgInputChange}
              errors={errors}
              onModeChange={(mode: "select" | "create") =>
                setOrganizationMode(mode)
              }
            />

            {submitError && <ErrorAlert message={submitError} />}
          </div>

          <div className="px-6 pb-6 pt-4 border-t">
            <ModalFooter
              onCancel={onClose}
              isSubmitting={isSubmitting}
              submitLabel={lead ? "Update Lead" : "Create Lead"}
              loadingLabel={
                organizationMode === "create" ? "Creating..." : "Saving..."
              }
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LeadModal;
