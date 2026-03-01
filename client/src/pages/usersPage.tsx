// hooks and basic imports
import { useState } from "react";
import { useUserData, useUsersStats } from "@/hooks";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// components imports
import { DataTable } from "@/components/common/dataTable";
import { columns } from "@/components/users/userColumns";
import { Button } from "@/components/ui/button";
import { UserModal } from "@/components/modals";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/common/confirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import UserStatistics from "@/components/users/userStatistics";
import { toast } from "sonner";

// other imports
import type { CreateUserDTO, User } from "@/types";
import { Search } from "lucide-react";

// notification imports
import { useNotifications } from "@/hooks";

// RBAC imports
import { useRoles } from "@/hooks/useRoles";
import { useHasPermission } from "@/hooks/usePermissions";
import { usersAPI } from "@/services/api/users.api";

const UsersPage = () => {
  // get tenant id from url params if present to fetch users of that tenant
  const { id } = useParams();

  const {
    filteredUsers,
    loading,
    loadingMore,
    error,
    filters,
    updateFilter,
    resetFilters,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    hasNextPage,
    loadMore,
  } = useUserData(id);

  const { data: usersStats, isLoading: statsLoading } = useUsersStats();

  // selected user for edit and delete
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // notifications
  const { notifyEvent } = useNotifications();

  // RBAC
  const canManageRoles = useHasPermission("users:manage_roles");
  const { data: availableRoles = [] } = useRoles();
  const queryClient = useQueryClient();

  // assign role dialog state
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [assignRoleUserId, setAssignRoleUserId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      usersAPI.assignRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      toast.success("Role assigned successfully");
      setAssignRoleDialogOpen(false);
      setAssignRoleUserId(null);
      setSelectedRoleId("");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to assign role";
      toast.error(message);
    },
  });

  const handleOpenAssignRole = (userId: string) => {
    const user = filteredUsers.find((u) => u._id === userId);
    setAssignRoleUserId(userId);
    setSelectedRoleId(user?.roleId ?? "");
    setAssignRoleDialogOpen(true);
  };

  const handleConfirmAssignRole = () => {
    if (!assignRoleUserId || !selectedRoleId) return;
    assignRoleMutation.mutate({ userId: assignRoleUserId, roleId: selectedRoleId });
  };


  // handle add user
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  // handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // handle save user for both create and update
  const handleSaveUser = async (userData: CreateUserDTO) => {
    if (selectedUser) {
      await updateUser(selectedUser._id, userData);
      toast.success("User updated successfully!");
      notifyEvent({
        type: "user_updated",
        title: "User Updated",
        message: `User ${userData.firstName} has been updated successfully.`,
        entityId: selectedUser._id,
        entityType: "user",
      });
    } else {
      await createUser(userData);
      toast.success("User created successfully!");
      notifyEvent({
        type: "user_created",
        title: "User Created",
        message: `User ${userData.firstName} has been created successfully.`,
        entityId: "", // You can set this to the new user's ID if your API returns it on creation
        entityType: "user",
      });
    }
    setIsModalOpen(false);
    setSelectedUser(null);
    toast.success("User saved successfully!");
  };

  const handleEditUser = (id: string) => {
    const user = filteredUsers.find((u) => u._id === id);
    if (user) {
      setSelectedUser(user);
      setIsModalOpen(true);
    }
  };

  // handle delete user
  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete);
      setUserToDelete(null);
      toast.success("User deleted successfully!");
      notifyEvent({
        type: "user_deleted",
        title: "User Deleted",
        message: `A user has been deleted successfully.`,
        entityId: userToDelete,
        entityType: "user",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. Please try again.");
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage team members and their permissions
          </p>
        </div>
        <div className="flex flex-row gap-4">
          <Button
            onClick={handleAddUser}
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Add User
          </Button>
        </div>
      </div>

      <UserStatistics statistics={usersStats} isLoading={statsLoading} />

      {/* Filters */}
      <div className=" rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={filters.role || "all"}
            onValueChange={(value) =>
              updateFilter("role", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              updateFilter("status", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={resetFilters}
            disabled={!filters.search && !filters.role && !filters.status}
            className="whitespace-nowrap"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              Failed to load users
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {error.message}
            </p>
            <Button
              onClick={() => fetchUsers()}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns({
            onEdit: handleEditUser,
            onDelete: handleDeleteUser,
            onAssignRole: canManageRoles ? handleOpenAssignRole : undefined,
          })}
          data={filteredUsers}
          name="Users"
          searchColumn="userEmail"
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          loadingMore={loadingMore}
        />
      )}

      <UserModal
        isOpen={isModalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      {/* Assign Role Dialog */}
      <Dialog
        open={assignRoleDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAssignRoleDialogOpen(false);
            setAssignRoleUserId(null);
            setSelectedRoleId("");
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role…" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignRoleDialogOpen(false);
                setAssignRoleUserId(null);
                setSelectedRoleId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAssignRole}
              disabled={!selectedRoleId || assignRoleMutation.isPending}
            >
              {assignRoleMutation.isPending ? "Saving…" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
