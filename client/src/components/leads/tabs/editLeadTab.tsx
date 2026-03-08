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
import { LEAD_SOURCES } from "@/types/interfaces/form-interfaces";
import { usePipelineData } from "@/hooks";

interface EditLeadTabProps {
  lead: Lead;
  onUpdate: (lead: Lead) => void;
}

function EditLeadTab({ lead, onUpdate }: EditLeadTabProps) {
  const { updateLead } = useLeadData();
  const { pipelines } = usePipelineData();
  const leadPipeline = pipelines.find((p) => p._id === lead.pipelineId);
  const availableStatuses = leadPipeline?.statuses ?? [];

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
        status: formData.status,
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
            className="border-gray-300 dark:border-gray-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName || ""}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            placeholder="Enter last name"
            className="border-gray-300 dark:border-gray-600"
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
            className="border-gray-300 dark:border-gray-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Lead Source</Label>
          <Select
            value={formData.source}
            onValueChange={(value) => handleInputChange("source", value)}
          >
            <SelectTrigger
              id="source"
              className="border-gray-300 dark:border-gray-600"
            >
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

        {formData.status !== "Converted" && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger
                id="status"
                className="border-gray-300 dark:border-gray-600"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses
                  .filter((s) => s.label !== "Converted")
                  .map((stage) => (
                    <SelectItem
                      key={stage.label}
                      value={stage.label}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: stage.color }}
                        />
                        {stage.label}
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">Lead Score</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Automatically calculated by the system
            </p>
          </div>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formData.score}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${formData.score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

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
