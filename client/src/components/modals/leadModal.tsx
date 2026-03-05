import { useState, useEffect, type FormEvent, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type {
  CreateLeadDTO,
  CreateOrganizationDTO,
  OrganizationIndustry,
} from "@/types";
import type {
  FormErrors,
  LeadFormData,
  LeadModalProps,
} from "@/types/interfaces/form-interfaces/lead.form.interfaces";
import { useOrganizationData } from "@/hooks";
import { organizationService } from "@/services";
import { FormField, FormSelect, UserCombobox } from "./form-fields";
import { ErrorAlert, ModalFooter } from "./shared";
import { OrganizationSection } from "./sections";

import {
  LEAD_SOURCES,
  LEAD_STATUSES,
} from "@/types/interfaces/form-interfaces";
import { mapToSelectOptions } from "@/components/modals/map-options/mapSelectLeadOptions";
import { useAppContext, useUserData } from "@/hooks";
import { useHasPermission } from "@/hooks/usePermissions";
import { validateLeadForm } from "@/utils/formValidators";
import { useOffline } from "@/context/useOffline";
import { toast } from "sonner";

function LeadModal({ isOpen, lead, onClose, onSave }: LeadModalProps) {
  const { organizations, fetchOrganizations } = useOrganizationData();

  const { user } = useAppContext();
  const { isOnline, addToQueue } = useOffline();

  const [formData, setFormData] = useState<LeadFormData>(
    lead
      ? {
          firstName: lead.firstName,
          lastName: lead.lastName || "",
          email: lead.email,
          source: lead.source,
          status: lead.status,
          score: lead.score,
          organizationId: lead.organizationId || "",
          assignedTo: lead.assignedTo || undefined,
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          source: "API",
          status: "New",
          score: 0,
          organizationId: "",
          assignedTo: undefined,
        },
  );
  const [organizationMode, setOrganizationMode] = useState<"select" | "create">(
    "select",
  );
  const [newOrgData, setNewOrgData] = useState({
    name: "",
    website: "",
    size: 10,
    industry: "Software",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sourceOptions = mapToSelectOptions(LEAD_SOURCES);
  const statusOptions = mapToSelectOptions(LEAD_STATUSES);

  useEffect(() => {
    if (isOpen) {
      fetchOrganizations();
    } else {
      // Reset form data when modal closes
      setFormData(
        lead
          ? {
              firstName: lead.firstName,
              lastName: lead.lastName || "",
              email: lead.email,
              source: lead.source,
              status: lead.status,
              score: lead.score,
              organizationId: lead.organizationId || "",
              assignedTo: lead.assignedTo || undefined,
            }
          : {
              firstName: "",
              lastName: "",
              email: "",
              source: "API",
              status: "New",
              score: 0,
              organizationId: "",
              assignedTo: undefined,
            },
      );
      setNewOrgData({
        name: "",
        website: "",
        size: 10,
        industry: "Software",
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [isOpen, fetchOrganizations, lead]);

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

    // --- Offline path ---
    if (!isOnline) {
      if (organizationMode === "create") {
        setSubmitError(
          "Creating a new organization requires an internet connection. Please select an existing organization or try again when online.",
        );
        setIsSubmitting(false);
        return;
      }

      const leadData: CreateLeadDTO = {
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        email: formData.email,
        source: formData.source,
        status: formData.status,
        organizationId: formData.organizationId || undefined,
        tenantId: user?.tenantId || "tenant-1",
      };

      addToQueue(
        "/api/leads",
        "POST",
        leadData,
        undefined,
        3,
        "leads",
        "create",
      );

      toast.info(
        "You're offline. Lead has been queued and will sync automatically when your connection is restored.",
      );
      onClose();
      setIsSubmitting(false);
      return;
    }

    try {
      let organizationId = formData.organizationId;

      if (organizationMode === "create") {
        const organizationData: CreateOrganizationDTO = {
          name: newOrgData.name,
          website: newOrgData.website,
          size: newOrgData.size,
          industry: newOrgData.industry as OrganizationIndustry,
          tenantId: user?.tenantId || "tenant-1",
        };

        const newOrg =
          await organizationService.createOrganization(organizationData);
        organizationId = newOrg._id;
      }

      const leadData: CreateLeadDTO = {
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        email: formData.email,
        source: formData.source,
        status: formData.status,
        organizationId: organizationId || undefined,
        tenantId: user?.tenantId || "tenant-1",
        assignedTo: canAssign ? formData.assignedTo || undefined : undefined,
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

  const canAssign = useHasPermission("leads:assign");
  const { users, loading: usersLoading, fetchUsers } = useUserData();

  useEffect(() => {
    if (canAssign) fetchUsers();
  }, [canAssign, fetchUsers]);

  const tenantUsers = useMemo<{ value: string; label: string }[]>(() => {
    if (!canAssign || !user?._id) return [];
    const others = users
      .filter((u) => u._id !== user._id)
      .map((u) => ({
        value: u._id,
        label: `${u.firstName} ${u.lastName ?? ""}`.trim(),
      }));
    return [{ value: user._id, label: "Assign to self" }, ...others];
  }, [canAssign, users, user]);

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
                id="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={(value) => handleInputChange("firstName", value)}
                placeholder="John"
                required
                error={errors.firstName}
              />

              <FormField
                id="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={(value) => handleInputChange("lastName", value)}
                placeholder="Doe"
              />
            </div>

            <FormField
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange("email", value)}
              placeholder="john.doe@example.com"
              required
              error={errors.email}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                id="source"
                label="Lead Source"
                value={formData.source}
                onChange={(value) => handleInputChange("source", value)}
                placeholder="Select source"
                options={sourceOptions}
              />

              <FormSelect
                id="status"
                label="Lead Status"
                value={formData.status}
                onChange={(value) => handleInputChange("status", value)}
                placeholder="Select status"
                options={statusOptions}
              />

              {canAssign && (
                <UserCombobox
                  id="assignedTo"
                  label="Assign To"
                  value={formData.assignedTo}
                  onChange={(value) => handleInputChange("assignedTo", value)}
                  placeholder={
                    usersLoading ? "Loading users..." : "Select user to assign"
                  }
                  options={tenantUsers}
                  disabled={usersLoading}
                />
              )}
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
                        style={{ width: `${formData.score}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 min-w-12 text-right">
                    {formData.score}
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
