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
  organizationName: string;
  organizationWebsite: string;
  organizationSize: number;
  organizationIndustry: string;
}

interface FormErrors {
  organizationName?: string;
  organizationWebsite?: string;
  organizationSize?: string;
  organizationIndustry?: string;
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
    onNewOrgChange("organizationName", "");
    onNewOrgChange("organizationWebsite", "");
    onNewOrgChange("organizationSize", 10);
    onNewOrgChange("organizationIndustry", "Software");
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
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
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="font-semibold">+ Create New Organization</span>
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
              onClick={handleCancel}
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
                onNewOrgChange("organizationName", e.target.value)
              }
              placeholder="Acme Corporation"
              className={`transition-all duration-200 ${errors.organizationName ? "border-red-500 shake" : "focus:ring-2 focus:ring-blue-500/20"}`}
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
                onNewOrgChange("organizationWebsite", e.target.value)
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
                  onNewOrgChange(
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
                  onNewOrgChange("organizationIndustry", value)
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
  );
}
