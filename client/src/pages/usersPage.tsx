import { useEffect, useState } from "react";
import { DataTable } from "../components/common/data-table";
import { columns } from "../components/users/user-columns";
import type { CreateUserDTO, User } from "@/types";
import { Button } from "../components/ui/button";
import { Download } from "lucide-react";
import { UserModal } from "@/components/modals";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
        _id: `user-${i + 1}`,
        firstName: ["John", "Jane", "Mike", "Sarah", "David", "Emma"][i % 6],
        lastName: ["Doe", "Smith", "Johnson", "Connor", "Brown", "Wilson"][
          i % 6
        ],
        userEmail: `user${i + 1}@example.com`,
        mobile:
          i % 3 === 0
            ? `+1${Math.floor(2000000000 + Math.random() * 1000000000)}`
            : undefined,
        role: ["user", "admin", "super_admin"][i % 3] as User["role"],
        tenantId: `tenant-1`,
        isActive: i % 5 !== 0,
        createdAt: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
        ),
        updatedAt: new Date(),
      }));
      setUsers(mockUsers);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAddUser = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (userData: CreateUserDTO) => {
    // TODO: Replace with actual API call
    console.log("Saving user:", userData);

    // Mock creating a new user
    const newUser: User = {
      _id: `user-${users.length + 1}`,
      firstName: userData.firstName,
      lastName: userData.lastName,
      userEmail: userData.userEmail,
      mobile: userData.mobile,
      role: userData.role || "user",
      tenantId: userData.tenantId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setIsModalOpen(false);
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
          <Button className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-35 disabled:bg-muted-foreground disabled:text-muted-foreground">
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

      <DataTable
        columns={columns}
        data={users}
        name="Users"
      ></DataTable>

      <UserModal
        isOpen={isModalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UsersPage;
