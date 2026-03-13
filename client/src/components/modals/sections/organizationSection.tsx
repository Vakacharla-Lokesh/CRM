import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  industryMap,
  type Organization,
  type OrganizationIndustry,
} from "@/types";

interface OrganizationFormData {
  name: string;
  website: string;
  size: number;
  industry: string;
}

interface FormErrors {
  name?: string;
  website?: string;
  size?: string;
  industry?: string;
}

interface OrganizationSectionProps {
  organizations: Organization[];
  selectedOrgId: string;
  onOrgSelect: (orgId: string) => void;
  newOrgData: OrganizationFormData;
  onNewOrgChange: (
    field: keyof OrganizationFormData,
    value: string | number,
  ) => void;
  errors: FormErrors;
  onModeChange?: (mode: "select" | "create") => void;
}

export function OrganizationSection({
  organizations,
  selectedOrgId,
  onOrgSelect,
  newOrgData,
  onNewOrgChange,
  errors,
  onModeChange,
}: OrganizationSectionProps) {
  const [organizationMode, setOrganizationMode] = useState<"select" | "create">(
    selectedOrgId ? "select" : "select",
  );

  const selectedOrganization = organizations.find(
    (org) => org._id === selectedOrgId,
  );

  const handleModeChange = (value: string) => {
    if (value === "create-new") {
      setOrganizationMode("create");
      onModeChange?.("create");
      onOrgSelect("");
    } else {
      setOrganizationMode("select");
      onModeChange?.("select");
      onOrgSelect(value);
    }
  };

  const handleCancel = () => {
    setOrganizationMode("select");
    onModeChange?.("select");
    onNewOrgChange("name", "");
    onNewOrgChange("website", "");
    onNewOrgChange("size", 10);
    onNewOrgChange("industry", "Software");
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg">
      <div className="space-y-2">
        <Label
          htmlFor="organization"
          className="text-sm font-semibold"
        >
          Organization
        </Label>
        <Select
          value={organizationMode === "create" ? "create-new" : selectedOrgId}
          onValueChange={handleModeChange}
        >
          <SelectTrigger id="organization">
            <SelectValue placeholder="Select or create organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="create-new">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="font-semibold">+ Create New Organization</span>
              </div>
            </SelectItem>
            {organizations.map((org) => (
              <SelectItem
                key={org._id}
                value={org._id}
              >
                <span>{org.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {organizationMode === "select" && selectedOrganization && (
        <div className="space-y-4 p-4 bg-muted rounded-lg border border-border">
          <div className="space-y-2">
            <Label
              htmlFor="selected-website"
              className="text-sm font-semibold"
            >
              Website
            </Label>
            <Input
              id="selected-website"
              type="text"
              value={selectedOrganization.website || ""}
              disabled
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="selected-size"
                className="text-sm font-semibold"
              >
                Organization Size
              </Label>
              <Input
                id="selected-size"
                type="text"
                value={selectedOrganization.size || ""}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="selected-industry"
                className="text-sm font-semibold"
              >
                Industry
              </Label>
              <Input
                id="selected-industry"
                type="text"
                value={selectedOrganization.industry || ""}
                disabled
              />
            </div>
          </div>
        </div>
      )}

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          organizationMode === "create"
            ? "max-h-200 opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center justify-between gap-2 p-3 bg-muted border border-border rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-foreground"
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
              <p className="text-sm text-muted-foreground">
                Create a new organization to associate with this lead
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-semibold"
            >
              Organization Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={newOrgData.name}
              onChange={(e) =>
                onNewOrgChange("name", e.target.value)
              }
              placeholder="Acme Corporation"
              className={`transition-all duration-200 ${errors.name ? "border-destructive" : ""}`}
            />
            {errors.name && (
              <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="website"
              className="text-sm font-semibold"
            >
              Website <span className="text-destructive">*</span>
            </Label>
            <Input
              id="website"
              type="url"
              value={newOrgData.website}
              onChange={(e) =>
                onNewOrgChange("website", e.target.value)
              }
              placeholder="https://www.acme.com"
              className={`transition-all duration-200 ${errors.website ? "border-destructive" : ""}`}
            />
            {errors.website && (
              <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                {errors.website}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="size"
                className="text-sm font-semibold"
              >
                Organization Size <span className="text-destructive">*</span>
              </Label>
              <Input
                id="size"
                type="number"
                min="1"
                max="10000000"
                value={newOrgData.size}
                onChange={(e) =>
                  onNewOrgChange(
                    "size",
                    parseInt(e.target.value) || 1,
                  )
                }
                placeholder="50"
                className={`transition-all duration-200 ${errors.size ? "border-destructive" : ""}`}
              />
              {errors.size && (
                <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                  {errors.size}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="industry"
                className="text-sm font-semibold"
              >
                Industry <span className="text-destructive">*</span>
              </Label>
              <Select
                value={newOrgData.industry}
                onValueChange={(value) =>
                  onNewOrgChange("industry", value)
                }
              >
                <SelectTrigger
                  id="industry"
                  className={`transition-all duration-200 ${
                    errors.industry
                      ? "border-destructive"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(industryMap) as OrganizationIndustry[]).map(
                    (industry) => (
                      <SelectItem
                        key={industry}
                        value={industry}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${industryMap[industry]}`}
                          />
                          <span>{industry}</span>
                        </div>
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                  {errors.industry}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
