import { useState } from "react";
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
import type { Lead } from "@/types";
import { useLeadData } from "@/hooks";
import { useOrganizationData } from "@/hooks/organizations/useOrganizationData";
import { OrganizationSection } from "@/components/modals/sections";
import { LEAD_SOURCES } from "@/types/interfaces/form-interfaces";

interface EditLeadTabProps {
  lead: Lead;
  onUpdate: (lead: Lead) => void;
}

function EditLeadTab({ lead, onUpdate }: EditLeadTabProps) {
  const { updateLead } = useLeadData();
  const { organizations } = useOrganizationData();

  const [formData, setFormData] = useState<Lead>(lead);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_organizationMode, setOrganizationMode] = useState<"select" | "create">(
    "select",
  );
  const [newOrgData, setNewOrgData] = useState({
    name: "",
    website: "",
    size: 0,
    industry: "",
  });

  const handleOrgInputChange = (field: string, value: string | number) => {
    setNewOrgData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field: keyof Lead, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      if (!formData.firstName.trim()) {
        setError("First name is required");
        return;
      }

      if (!formData.email.trim()) {
        setError("Email is required");
        return;
      }

      updateLead(lead._id, {
        firstName: formData.firstName,
        lastName: formData.lastName || "",
        email: formData.email,
        source: formData.source,
        organizationId: formData.organizationId || undefined,
      });

      onUpdate(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setIsSaving(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update lead";
      setError(message);
      console.error("Error updating lead:", err);
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(lead);

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">
            Lead updated successfully!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            placeholder="Enter first name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName || ""}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            placeholder="Enter last name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Lead Source</Label>
          <Select
            value={formData.source}
            onValueChange={(value) => handleInputChange("source", value)}
          >
            <SelectTrigger id="source">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectItem value="API">API</SelectItem>
              <SelectItem value="Outsource">Outsource</SelectItem> */}
              {LEAD_SOURCES.map((source) => (
                <SelectItem
                  key={source.value}
                  value={source.value}
                >
                  {source.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 p-4 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">Lead Score</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically calculated by the system
            </p>
          </div>
          <span className="text-2xl font-bold text-primary">
            {formData.score}
          </span>
        </div>

        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 bg-primary"
            style={{ width: `${formData.score}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      <OrganizationSection
        organizations={organizations}
        selectedOrgId={formData.organizationId || ""}
        onOrgSelect={(orgId) => handleInputChange("organizationId", orgId)}
        newOrgData={newOrgData}
        onNewOrgChange={handleOrgInputChange}
        errors={{}}
        onModeChange={setOrganizationMode}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="text-sm font-medium text-foreground">
            {new Date(lead.createdAt).toLocaleDateString()} at{" "}
            {new Date(lead.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Last Updated</p>
          <p className="text-sm font-medium text-foreground">
            {new Date(lead.updatedAt).toLocaleDateString()} at{" "}
            {new Date(lead.updatedAt).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-border">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

export default EditLeadTab;
