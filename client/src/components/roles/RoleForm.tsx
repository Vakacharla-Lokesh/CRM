import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PermissionSelector } from "./PermissionSelector";
import type { Role, CreateRoleDTO, UpdateRoleDTO } from "@/types";

interface RoleFormProps {
  role?: Role | null;
  onSubmit: (dto: CreateRoleDTO | UpdateRoleDTO) => void;
  onCancel: () => void;
  isLoading: boolean;
}

interface RoleFormErrors {
  name?: string;
  permissions?: string;
}

export function RoleForm({
  role,
  onSubmit,
  onCancel,
  isLoading,
}: RoleFormProps) {
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [permissions, setPermissions] = useState<string[]>(
    role?.permissions ?? [],
  );
  const [errors, setErrors] = useState<RoleFormErrors>({});

  const isSystemRole = role?.isSystemRole ?? false;
  const isEditing = !!role;

  const validate = (): boolean => {
    const newErrors: RoleFormErrors = {};
    if (!name.trim()) newErrors.name = "Role name is required";
    if (permissions.length === 0)
      newErrors.permissions = "Select at least one permission";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      permissions,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="space-y-1">
        <Label htmlFor="role-name">
          Role Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="role-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sales Manager"
          disabled={isSystemRole}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
        {isSystemRole && (
          <p className="text-xs text-muted-foreground">
            System roles cannot be renamed.
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="role-description">Description</Label>
        <Textarea
          id="role-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this role's responsibilities"
          rows={2}
          disabled={isSystemRole}
        />
      </div>

      <div className="space-y-2">
        <Label>
          Permissions <span className="text-destructive">*</span>
        </Label>
        {isSystemRole && (
          <p className="text-xs text-muted-foreground mb-2">
            Permissions for system roles are managed internally and cannot be
            changed.
          </p>
        )}
        <PermissionSelector
          value={permissions}
          onChange={setPermissions}
          disabled={isSystemRole}
        />
        {errors.permissions && (
          <p className="text-xs text-destructive">{errors.permissions}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isSystemRole}
        >
          {isLoading
            ? isEditing
              ? "Saving…"
              : "Creating…"
            : isEditing
              ? "Save Changes"
              : "Create Role"}
        </Button>
      </div>
    </form>
  );
}
