import { useState } from "react";
import UserTable from "../common/userTable";
import UserModal from "../modals/userModal";
import type { User } from "../../types";

interface UserFormData {
  firstName: string;
  lastName: string;
  userEmail: string;
  mobile: string;
  role: "user" | "admin" | "super_admin";
}

/**
 * UsersPage Component
 * Route: /users
 * Purpose: User management interface with table view and CRUD operations
 * Features:
 * - User data table with sorting and filtering
 * - Add new user button
 * - Edit user functionality
 * - Delete user with confirmation
 * - Search and filter users
 * - Responsive table layout
 */
function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    {
      _id: "1",
      firstName: "John",
      lastName: "Doe",
      userEmail: "john@example.com",
      mobile: "+1 234-567-8900",
      role: "admin",
      tenantId: "tenant-1",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
      isActive: true,
    },
    {
      _id: "2",
      firstName: "Jane",
      lastName: "Smith",
      userEmail: "jane@example.com",
      mobile: "+1 234-567-8901",
      role: "user",
      tenantId: "tenant-1",
      createdAt: new Date("2024-01-20"),
      updatedAt: new Date("2024-01-20"),
      isActive: true,
    },
    {
      _id: "3",
      firstName: "Mike",
      lastName: "Johnson",
      userEmail: "mike@example.com",
      mobile: "+1 234-567-8902",
      role: "user",
      tenantId: "tenant-1",
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01"),
      isActive: true,
    },
    {
      _id: "4",
      firstName: "Sarah",
      lastName: "Connor",
      userEmail: "sarah@example.com",
      mobile: "+1 234-567-8903",
      role: "user",
      tenantId: "tenant-1",
      createdAt: new Date("2024-02-05"),
      updatedAt: new Date("2024-02-05"),
      isActive: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u._id !== user._id));
    }
  };

  const handleSaveUser = (userData: UserFormData) => {
    if (selectedUser) {
      // Update existing user
      setUsers(
        users.map((user) =>
          user._id === selectedUser._id ? { ...user, ...userData, updatedAt: new Date() } : user,
        ),
      );
    } else {
      // Add new user
      const newUser: User = {
        _id: String(Math.max(...users.map((u) => Number(u._id)), 0) + 1),
        ...userData,
        tenantId: "tenant-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage team members and their permissions
          </p>
        </div>
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <span>+</span> Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <UserTable
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2H0v-2a9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            No users found
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
            {searchTerm
              ? "Try a different search"
              : 'Click "Add User" to create a new one'}
          </p>
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        user={selectedUser}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
}

export default UsersPage;
