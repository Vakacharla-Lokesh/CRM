import { useState, useEffect } from "react";
import { DataTable } from "../components/common/dataTable";
import { columns } from "../components/users/userColumns";
import type { CreateUserDTO, User } from "@/types";
import { Button } from "../components/ui/button";
import { Download, Search } from "lucide-react";
import { UserModal } from "@/components/modals";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserData } from "@/hooks";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useParams } from "react-router-dom";

const UsersPage = () => {
  const { id } = useParams();
  const {
    filteredUsers,
    statistics,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
    createUser,
    updateUser,
    deleteUser,
    fetchUserByTenant,
  } = useUserData();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchUserByTenant(id);
    }
  }, [fetchUserByTenant, id]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (userData: CreateUserDTO) => {
    if (selectedUser) {
      await updateUser(selectedUser._id, userData);
    } else {
      await createUser(userData);
    }
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleEditUser = (id: string) => {
    const user = filteredUsers.find((u) => u._id === id);
    if (user) {
      setSelectedUser(user);
      setIsModalOpen(true);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete);

    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    } finally {
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
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-35 disabled:bg-muted-foreground"
            disabled={true}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={handleAddUser}
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Users
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {statistics.total}
          </p>
        </div>
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {statistics.active}
          </p>
        </div>
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {statistics.inactive}
          </p>
        </div>
        <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {(statistics.byRole.admin || 0) +
              (statistics.byRole.super_admin || 0)}
          </p>
        </div>
      </div>

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
              onClick={() => id && fetchUserByTenant(id)}
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
          })}
          data={filteredUsers}
          name="Users"
          searchColumn="userEmail"
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
    </div>
  );
};

export default UsersPage;
