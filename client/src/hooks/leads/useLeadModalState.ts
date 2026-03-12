/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, type FormEvent, useMemo } from "react";
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
import { organizationService } from "@/services";

import {
  LEAD_SOURCES,
  LEAD_STATUSES,
} from "@/types/interfaces/form-interfaces";
import { mapToSelectOptions } from "@/components/modals/map-options/mapSelectLeadOptions";
import {
  useAppContext,
  useUserData,
  usePipelineData,
  useOrganizationData,
} from "@/hooks";
import { useHasPermission } from "@/hooks/usePermissions";
import { validateLeadForm } from "@/utils/formValidators";
import { useOffline } from "@/context/useOffline";
import { toast } from "sonner";

export function useLeadModalState({
  isOpen,
  lead,
  onClose,
  onSave,
}: LeadModalProps) {
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
          pipelineId: lead.pipelineId || undefined,
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
          pipelineId: undefined,
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
              pipelineId: lead.pipelineId || undefined,
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
              pipelineId: undefined,
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
        pipelineId: formData.pipelineId || undefined,
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

  const { pipelines, isLoading: pipelinesLoading } = usePipelineData();

  const pipelineOptions = useMemo(
    () =>
      pipelines.map((p) => ({
        value: p._id,
        label: p.isDefault ? `${p.name} (Default)` : p.name,
      })),
    [pipelines],
  );

  // Auto-select default pipeline for new leads
  useEffect(() => {
    if (!lead && pipelines.length > 0 && !formData.pipelineId) {
      const defaultPipeline = pipelines.find((p) => p.isDefault);
      if (defaultPipeline) {
        setFormData((prev) => ({ ...prev, pipelineId: defaultPipeline._id }));
      }
    }
  }, [lead, pipelines, formData.pipelineId]);

  return {
    formData,
    organizationMode,
    newOrgData,
    errors,
    isSubmitting,
    submitError,
    sourceOptions,
    statusOptions,
    tenantUsers,
    usersLoading,
    pipelineOptions,
    pipelinesLoading,
    handleInputChange,
    handleOrgInputChange,
    handleSubmit,
    organizations,
    setOrganizationMode,
    canAssign,
  };
}
