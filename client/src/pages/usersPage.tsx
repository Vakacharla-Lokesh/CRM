// hooks and basic imports
import { useState } from "react";
import { useUserData, useUsersStats } from "@/hooks";
import { useRoles } from "@/hooks/roles/useRoles";
import { useParams } from "react-router-dom";

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
import UserStatistics from "@/components/users/userStatistics";
import { toast } from "sonner";

// other imports
import type { CreateUserDTO, User } from "@/types";
import { Search } from "lucide-react";

// notification imports
import { useNotifications } from "@/hooks";

// RBAC imports
import { useHasPermission } from "@/hooks/usePermissions";

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

  const { data: usersStats, isLoading: statsLoading } = useUsersStats({
    role: filters.role || undefined,
    status: filters.status || undefined,
  });

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

  // dynamic roles for filter dropdown
  const { data: roles } = useRoles();

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
      notifyEvent({
        type: "user_updated",
        title: "User Updated",
        message: `User ${userData.firstName} has been updated successfully.`,
        entityId: selectedUser._id,
        entityType: "user",
      });
    } else {
      await createUser(userData);
      notifyEvent({
        type: "user_created",
        title: "User Created",
        message: `User ${userData.firstName} has been created successfully.`,
        entityId: "",
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

      <UserStatistics
        statistics={usersStats}
        isLoading={statsLoading}
      />

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
              {roles?.map((role) => (
                <SelectItem key={role._id} value={role.name}>
                  {role.name}
                </SelectItem>
              ))}
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
            onAssignRole: canManageRoles ? handleEditUser : undefined,
          })}
          data={filteredUsers}
          name="Users"
          searchColumn="email"
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          loadingMore={loadingMore}
        />
      )}

      <UserModal
        key={selectedUser?._id ?? "new"}
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
    </div>
  );
};

export default UsersPage;
