import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { LeadModalProps } from "@/types/interfaces/form-interfaces/lead.form.interfaces";
import { FormField, FormSelect, UserCombobox } from "./form-fields";
import { ErrorAlert, ModalFooter } from "./shared";
import { OrganizationSection } from "./sections";
import { useLeadModalState } from "@/hooks/leads/useLeadModalState";

function LeadModal({ isOpen, lead, onClose, onSave }: LeadModalProps) {
  const {
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
  } = useLeadModalState({ isOpen, lead, onClose, onSave });

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

              <FormSelect
                id="pipelineId"
                label="Pipeline"
                value={formData.pipelineId ?? ""}
                onChange={(value) => handleInputChange("pipelineId", value)}
                placeholder={
                  pipelinesLoading ? "Loading pipelines..." : "Select pipeline"
                }
                options={pipelineOptions}
                disabled={pipelinesLoading}
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
