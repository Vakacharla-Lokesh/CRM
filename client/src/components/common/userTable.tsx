import type { User } from "../../types";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin:
        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
      admin: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      user: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    };
    return colors[role] || colors.user;
  };

  const getStatusColor = (status: boolean) => {
    return status
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Mobile
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Role
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Created
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                      {(user.firstName || "")[0]?.toUpperCase() || ""}
                      {(user.lastName || "")[0]?.toUpperCase() || ""}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName || ""}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {user.userEmail}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {user.mobile || "N/A"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                      user.role,
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      user.isActive ?? true,
                    )}`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
                      title="Edit user"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                      title="Delete user"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserTable;
