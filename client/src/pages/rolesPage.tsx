import { useState } from "react";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/hooks/useRoles";
import { useHasPermission } from "@/hooks/usePermissions";
import { RoleForm } from "@/components/roles/RoleForm";
import { ConfirmDialog } from "@/components/common/confirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldCheck, Plus, Pencil, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import type { Role, CreateRoleDTO, UpdateRoleDTO } from "@/types";

const RolesPage = () => {
  const { data: roles = [], isLoading, error } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const canWrite = useHasPermission("roles:write");
  const canDelete = useHasPermission("roles:delete");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const handleCreate = () => {
    setEditingRole(null);
    setDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingRole(null);
  };

  const handleSubmit = async (dto: CreateRoleDTO | UpdateRoleDTO) => {
    try {
      if (editingRole) {
        await updateRole.mutateAsync({
          roleId: editingRole._id,
          updates: dto as UpdateRoleDTO,
        });
        toast.success(`Role "${editingRole.name}" updated successfully`);
      } else {
        await createRole.mutateAsync(dto as CreateRoleDTO);
        toast.success("Role created successfully");
      }
      handleDialogClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole.mutateAsync(roleToDelete._id);
      toast.success(`Role "${roleToDelete.name}" deleted`);
      setRoleToDelete(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete role";
      toast.error(message);
    }
  };

  const isMutating =
    createRole.isPending || updateRole.isPending || deleteRole.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Roles &amp; Permissions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage roles and their associated permissions for your organisation
          </p>
        </div>
        {canWrite && (
          <Button
            onClick={handleCreate}
            disabled={isMutating}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={16} />
            Create Role
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading roles…</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-destructive text-5xl mb-4">⚠️</div>
            <p className="text-destructive font-semibold mb-2">
              Failed to load roles
            </p>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      ) : roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldCheck
            size={48}
            className="text-muted-foreground mb-4"
          />
          <h3 className="text-lg font-semibold mb-1">No roles yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create a role to start managing permissions.
          </p>
          {canWrite && (
            <Button
              onClick={handleCreate}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Create Role
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {roles.map((role) => (
            <div
              key={role._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-card p-5 shadow-sm"
            >
              {/* Left section */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold truncate">
                    {role.name}
                  </h3>
                  {role.isSystemRole && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 text-xs"
                    >
                      <Lock size={10} />
                      System
                    </Badge>
                  )}
                  <Badge
                    variant={role.isActive ? "default" : "outline"}
                    className="text-xs"
                  >
                    {role.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {role.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {role.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {role.permissions.length}
                  </span>{" "}
                  permission{role.permissions.length !== 1 ? "s" : ""} assigned
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {canWrite && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(role)}
                    disabled={isMutating}
                    className="flex items-center gap-1"
                  >
                    <Pencil size={14} />
                    {role.isSystemRole ? "View" : "Edit"}
                  </Button>
                )}
                {canDelete && !role.isSystemRole && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(role)}
                    disabled={isMutating}
                    className="flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
            <DialogTitle>
              {editingRole
                ? editingRole.isSystemRole
                  ? `View Role: ${editingRole.name}`
                  : `Edit Role: ${editingRole.name}`
                : "Create New Role"}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-4">
            <RoleForm
              key={editingRole?._id ?? "new-role"}
              role={editingRole}
              onSubmit={handleSubmit}
              onCancel={handleDialogClose}
              isLoading={createRole.isPending || updateRole.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Role"
        description={`Are you sure you want to delete "${roleToDelete?.name}"? Users assigned this role will lose its permissions. This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default RolesPage;
