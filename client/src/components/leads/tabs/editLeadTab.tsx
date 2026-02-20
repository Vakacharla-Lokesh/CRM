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

interface EditLeadTabProps {
  lead: Lead;
  onUpdate: (lead: Lead) => void;
}

function EditLeadTab({ lead, onUpdate }: EditLeadTabProps) {
  const { updateLead } = useLeadData();

  const [formData, setFormData] = useState<Lead>(lead);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

      // Validate required fields
      if (!formData.leadFirstName.trim()) {
        setError("First name is required");
        return;
      }

      if (!formData.leadEmail.trim()) {
        setError("Email is required");
        return;
      }

      updateLead(lead._id, {
        leadFirstName: formData.leadFirstName,
        leadLastName: formData.leadLastName || "",
        leadEmail: formData.leadEmail,
        leadSource: formData.leadSource,
        leadStatus: formData.leadStatus,
      });

      onUpdate(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update lead";
      setError(message);
      console.error("Error updating lead:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(lead);

  return (
    <div className="space-y-6">
      {/* Status Messages */}
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

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.leadFirstName}
            onChange={(e) => handleInputChange("leadFirstName", e.target.value)}
            placeholder="Enter first name"
            className="border-gray-300 dark:border-gray-600"
          />
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.leadLastName || ""}
            onChange={(e) => handleInputChange("leadLastName", e.target.value)}
            placeholder="Enter last name"
            className="border-gray-300 dark:border-gray-600"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.leadEmail}
            onChange={(e) => handleInputChange("leadEmail", e.target.value)}
            placeholder="Enter email address"
            className="border-gray-300 dark:border-gray-600"
          />
        </div>

        {/* Lead Source */}
        <div className="space-y-2">
          <Label htmlFor="source">Lead Source</Label>
          <Select
            value={formData.leadSource}
            onValueChange={(value) => handleInputChange("leadSource", value)}
          >
            <SelectTrigger
              id="source"
              className="border-gray-300 dark:border-gray-600"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="API">API</SelectItem>
              <SelectItem value="Outsource">Outsource</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lead Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.leadStatus}
            onValueChange={(value) => handleInputChange("leadStatus", value)}
          >
            <SelectTrigger
              id="status"
              className="border-gray-300 dark:border-gray-600"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Dead">Dead</SelectItem>
              <SelectItem value="Follow-Up">Follow-Up</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lead Score - Read Only */}
      <div className="space-y-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">Lead Score</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Automatically calculated by the system
            </p>
          </div>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formData.leadScore}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${formData.leadScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <p className="text-xs text-gray-600 dark:text-gray-400">Created</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(lead.createdAt).toLocaleDateString()} at{" "}
            {new Date(lead.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Last Updated
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(lead.updatedAt).toLocaleDateString()} at{" "}
            {new Date(lead.updatedAt).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
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
