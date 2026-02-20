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
import type { CreateLeadDTO, CreateOrganizationDTO } from "@/types";
import type {
  FormErrors,
  LeadFormData,
  LeadModalProps,
} from "@/types/form-interfaces/leadForm.interfaces";
import { useOrganizationData } from "@/hooks";
import { organizationService } from "@/services";

function LeadModal({ isOpen, lead, onClose, onSave }: LeadModalProps) {
  const { organizations, fetchOrganizations } = useOrganizationData();

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
    const newErrors: FormErrors = {};

    if (!formData.leadFirstName.trim()) {
      newErrors.leadFirstName = "First name is required";
    }

    if (!formData.leadEmail.trim()) {
      newErrors.leadEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.leadEmail)) {
      newErrors.leadEmail = "Invalid email format";
    }

    // Validate organization fields if creating new organization
    if (organizationMode === "create") {
      if (!newOrgData.organizationName.trim()) {
        newErrors.organizationName = "Organization name is required";
      }

      if (!newOrgData.organizationWebsite.trim()) {
        newErrors.organizationWebsite = "Website is required";
      } else if (
        !/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!/-]))?$/.test(
          newOrgData.organizationWebsite,
        )
      ) {
        newErrors.organizationWebsite = "Please provide a valid website URL";
      }

      if (
        newOrgData.organizationSize < 1 ||
        newOrgData.organizationSize > 10000000
      ) {
        newErrors.organizationSize =
          "Organization size must be between 1 and 10,000,000";
      }

      if (!newOrgData.organizationIndustry) {
        newErrors.organizationIndustry = "Industry is required";
      }
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
    setSubmitError(null);

    try {
      let organizationId = formData.organizationId;

      // Create new organization if in create mode
      if (organizationMode === "create") {
        const organizationData: CreateOrganizationDTO = {
          organizationName: newOrgData.organizationName,
          organizationWebsite: newOrgData.organizationWebsite,
          organizationSize: newOrgData.organizationSize,
          organizationIndustry: newOrgData.organizationIndustry,
          tenantId: "tenant-1",
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
        tenantId: "tenant-1",
      };

      await onSave(leadData);
      onClose();
    } catch (error) {
      console.error("Error saving lead:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save lead. Please try again.";
      setSubmitError(errorMessage);
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
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
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
                  <SelectItem value="Phone">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Phone</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Website">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span>Website</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Facebook Ads">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-700"></div>
                      <span>Facebook Ads</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Google Ads">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>Google Ads</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Instagram">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                      <span>Instagram</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="LinkedIn">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-800"></div>
                      <span>LinkedIn</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Email Marketing">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span>Email Marketing</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Referral">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <span>Referral</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Cold Call">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span>Cold Call</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="WhatsApp">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-700"></div>
                      <span>WhatsApp</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Other">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      <span>Other</span>
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

          <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
            <div className="space-y-2">
              <Label
                htmlFor="organization"
                className="text-sm font-semibold"
              >
                Organization
              </Label>
              <Select
                value={
                  organizationMode === "create"
                    ? "create-new"
                    : formData.organizationId
                }
                onValueChange={(value) => {
                  if (value === "create-new") {
                    setOrganizationMode("create");
                    setFormData((prev) => ({ ...prev, organizationId: "" }));
                  } else {
                    setOrganizationMode("select");
                    handleInputChange("organizationId", value);
                  }
                }}
              >
                <SelectTrigger id="organization">
                  <SelectValue placeholder="Select or create organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create-new">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="font-semibold">
                        + Create New Organization
                      </span>
                    </div>
                  </SelectItem>
                  {organizations.map((org) => (
                    <SelectItem
                      key={org._id}
                      value={org._id}
                    >
                      <div className="flex flex-col">
                        <span>{org.organizationName}</span>
                        <span className="text-xs text-gray-500">
                          {org.organizationIndustry} • {org.organizationSize}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                organizationMode === "create"
                  ? "max-h-200 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center justify-between gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Create a new organization to associate with this lead
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOrganizationMode("select");
                      setNewOrgData({
                        organizationName: "",
                        organizationWebsite: "",
                        organizationSize: 10,
                        organizationIndustry: "Software",
                      });
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="organizationName"
                    className="text-sm font-semibold"
                  >
                    Organization Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="organizationName"
                    value={newOrgData.organizationName}
                    onChange={(e) =>
                      handleOrgInputChange("organizationName", e.target.value)
                    }
                    placeholder="Acme Corporation"
                    className={`transition-all duration-200 ${errors.organizationName ? "border-red-500 shake" : "focus:ring-2 focus:ring-blue-500/20"}`}
                    autoFocus
                  />
                  {errors.organizationName && (
                    <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                      {errors.organizationName}
                    </p>
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
                    value={newOrgData.organizationWebsite}
                    onChange={(e) =>
                      handleOrgInputChange(
                        "organizationWebsite",
                        e.target.value,
                      )
                    }
                    placeholder="https://www.acme.com"
                    className={`transition-all duration-200 ${errors.organizationWebsite ? "border-red-500 shake" : "focus:ring-2 focus:ring-blue-500/20"}`}
                  />
                  {errors.organizationWebsite && (
                    <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
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
                      value={newOrgData.organizationSize}
                      onChange={(e) =>
                        handleOrgInputChange(
                          "organizationSize",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      placeholder="50"
                      className={`transition-all duration-200 ${errors.organizationSize ? "border-red-500 shake" : "focus:ring-2 focus:ring-blue-500/20"}`}
                    />
                    {errors.organizationSize && (
                      <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
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
                      value={newOrgData.organizationIndustry}
                      onValueChange={(value) =>
                        handleOrgInputChange("organizationIndustry", value)
                      }
                    >
                      <SelectTrigger
                        id="organizationIndustry"
                        className={`transition-all duration-200 ${
                          errors.organizationIndustry
                            ? "border-red-500 shake"
                            : "focus:ring-2 focus:ring-blue-500/20"
                        }`}
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
                      <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                        {errors.organizationIndustry}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                {submitError}
              </p>
            </div>
          )}

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
                  <span>
                    {organizationMode === "create"
                      ? "Creating..."
                      : "Saving..."}
                  </span>
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
