import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PERMISSION_MAP, permissionLabel } from "@/types/constants/permissions";

interface PermissionSelectorProps {
  value: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export function PermissionSelector({
  value,
  onChange,
  disabled = false,
}: PermissionSelectorProps) {
  const selected = new Set(value);

  const toggle = (permission: string) => {
    if (disabled) return;
    const next = new Set(selected);
    if (next.has(permission)) {
      next.delete(permission);
    } else {
      next.add(permission);
    }
    onChange(Array.from(next));
  };

  const toggleGroup = (groupPermissions: string[]) => {
    if (disabled) return;
    const allSelected = groupPermissions.every((p) => selected.has(p));
    const next = new Set(selected);
    if (allSelected) {
      groupPermissions.forEach((p) => next.delete(p));
    } else {
      groupPermissions.forEach((p) => next.add(p));
    }
    onChange(Array.from(next));
  };

  return (
    <div className="space-y-4">
      {Object.entries(PERMISSION_MAP).map(([group, permissions]) => {
        const allSelected = permissions.every((p) => selected.has(p));
        const someSelected = permissions.some((p) => selected.has(p));

        return (
          <div
            key={group}
            className="border rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                id={`group-${group}`}
                checked={allSelected}
                data-state={someSelected && !allSelected ? "indeterminate" : undefined}
                onCheckedChange={() => toggleGroup(permissions)}
                disabled={disabled}
              />
              <Label
                htmlFor={`group-${group}`}
                className="text-sm font-semibold cursor-pointer"
              >
                {group}
              </Label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 ml-6">
              {permissions.map((permission) => (
                <div
                  key={permission}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    id={permission}
                    checked={selected.has(permission)}
                    onCheckedChange={() => toggle(permission)}
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={permission}
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    {permissionLabel(permission)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
