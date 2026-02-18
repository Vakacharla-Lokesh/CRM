import { useState, useEffect, useCallback } from "react";
import { userService } from "../services/userService.ts";
import { useAsync } from "./useAsync";
import { useIndexedDB } from "./useIndexedDB";
import type { User, UserRole } from "../types";

interface UserStatistics {
  total: number;
  byRole: Record<UserRole | string, number>;
  active: number;
  inactive: number;
}

interface UserFilters {
  role: UserRole | "";
  status: "active" | "inactive" | "";
  search: string;
}

/**
 * User Data Management Hook
 * Handles all user-related operations including CRUD, filtering, and statistics
 *
 * @returns User data and operations
 */
export const useUserData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics>({
    total: 0,
    byRole: {},
    active: 0,
    inactive: 0,
  });
  const [filters, setFilters] = useState<UserFilters>({
    role: "",
    status: "",
    search: "",
  });

  const {
    execute: executeAsync,
    loading,
    error,
  } = useAsync<User | User[] | void>();
  const { addItem, updateItem, deleteItem } = useIndexedDB("users");

  /**
   * Calculate statistics from users
   */
  const calculateStatistics = useCallback((usersData: User[]) => {
    const stats: UserStatistics = {
      total: usersData.length,
      byRole: {},
      active: 0,
      inactive: 0,
    };

    usersData.forEach((user) => {
      // Count by role
      stats.byRole[user.role] = (stats.byRole[user.role] ?? 0) + 1;

      // Count active/inactive
      if (user.isActive !== false) {
        stats.active += 1;
      } else {
        stats.inactive += 1;
      }
    });

    setStatistics(stats);
  }, []);

  /**
   * Apply filters to users
   */
  const applyFilters = useCallback(() => {
    let filtered = [...users];

    // Filter by role
    if (filters.role) {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    // Filter by status
    if (filters.status) {
      if (filters.status === "active") {
        filtered = filtered.filter((user) => user.isActive !== false);
      } else if (filters.status === "inactive") {
        filtered = filtered.filter((user) => user.isActive === false);
      }
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          (user.firstName?.toLowerCase().includes(searchLower) ?? false) ||
          (user.lastName?.toLowerCase().includes(searchLower) ?? false) ||
          (user.userEmail?.toLowerCase().includes(searchLower) ?? false),
      );
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

  /**
   * Fetch all users from API
   */
  const fetchUsers = useCallback(async () => {
    return executeAsync(async () => {
      const data = await userService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
      calculateStatistics(data);

      // Persist to IndexedDB
      for (const user of data) {
        await addItem({ ...user, id: user._id });
      }

      return data;
    });
  }, [executeAsync, addItem, calculateStatistics]);

  /**
   * Fetch single user by ID
   */
  const fetchUserById = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        const user = await userService.getUserById(id);
        return user;
      });
    },
    [executeAsync],
  );

  /**
   * Fetch current user
   */
  const fetchCurrentUser = useCallback(async () => {
    return executeAsync(async () => {
      const user = await userService.getCurrentUser();
      return user;
    });
  }, [executeAsync]);

  /**
   * Create new user
   */
  const createUser = useCallback(
    async (userData: Partial<User>) => {
      return executeAsync(async () => {
        const newUser = await userService.createUser(userData);
        setUsers((prev) => [...prev, newUser]);
        await addItem({ ...newUser, id: newUser._id });
        await fetchUsers(); // Refresh to recalculate stats
        return newUser;
      });
    },
    [executeAsync, addItem, fetchUsers],
  );

  /**
   * Update existing user
   */
  const updateUser = useCallback(
    async (id: string, updates: Partial<User>) => {
      return executeAsync(async () => {
        const updated = await userService.updateUser(id, updates);
        setUsers((prev) =>
          prev.map((user) => (user._id === id ? updated : user)),
        );
        await updateItem(id, { ...updated, id: updated._id });
        await fetchUsers(); // Refresh to recalculate stats
        return updated;
      });
    },
    [executeAsync, updateItem, fetchUsers],
  );

  /**
   * Delete user
   */
  const deleteUser = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        await userService.deleteUser(id);
        setUsers((prev) => prev.filter((user) => user._id !== id));
        await deleteItem(id);
        await fetchUsers(); // Refresh to recalculate stats
      });
    },
    [executeAsync, deleteItem, fetchUsers],
  );

  /**
   * Search users
   */
  const searchUsers = useCallback(
    async (query: string) => {
      return executeAsync(async () => {
        const results = await userService.searchUsers(query);
        return results;
      });
    },
    [executeAsync],
  );

  /**
   * Get users by role
   */
  const getUsersByRole = useCallback(
    async (role: UserRole) => {
      return executeAsync(async () => {
        const results = await userService.getUsersByRole(role);
        return results;
      });
    },
    [executeAsync],
  );

  /**
   * Update user password
   */
  const updatePassword = useCallback(
    async (id: string, oldPassword: string, newPassword: string) => {
      return executeAsync(async () => {
        await userService.updatePassword(id, { oldPassword, newPassword });
      });
    },
    [executeAsync],
  );

  /**
   * Update user role
   */
  const updateUserRole = useCallback(
    async (id: string, role: UserRole) => {
      return executeAsync(async () => {
        const updated = await userService.updateRole(id, role);
        setUsers((prev) =>
          prev.map((user) => (user._id === id ? updated : user)),
        );
        await updateItem(id, { ...updated, id: updated._id });
        await fetchUsers(); // Refresh to recalculate stats
        return updated;
      });
    },
    [executeAsync, updateItem, fetchUsers],
  );

  /**
   * Activate user
   */
  const activateUser = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        const updated = await userService.activateUser(id);
        setUsers((prev) =>
          prev.map((user) => (user._id === id ? updated : user)),
        );
        await updateItem(id, { ...updated, id: updated._id });
        await fetchUsers(); // Refresh to recalculate stats
        return updated;
      });
    },
    [executeAsync, updateItem, fetchUsers],
  );

  /**
   * Deactivate user
   */
  const deactivateUser = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        const updated = await userService.deactivateUser(id);
        setUsers((prev) =>
          prev.map((user) => (user._id === id ? updated : user)),
        );
        await updateItem(id, { ...updated, id: updated._id });
        await fetchUsers(); // Refresh to recalculate stats
        return updated;
      });
    },
    [executeAsync, updateItem, fetchUsers],
  );

  /**
   * Update filter
   */
  const updateFilter = useCallback((key: keyof UserFilters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    setFilters({
      role: "",
      status: "",
      search: "",
    });
    setFilteredUsers(users);
  }, [users]);

  /**
   * Bulk update users
   */
  const bulkUpdateUsers = useCallback(
    async (ids: string[], updates: Partial<User>) => {
      return executeAsync(async () => {
        await userService.bulkUpdateUsers(ids, updates);
        const updatedUsers = ids.map(id => {
          const user = users.find(u => u._id === id);
          return user ? { ...user, ...updates } : null;
        }).filter(Boolean) as User[];
        
        setUsers((prev) =>
          prev.map((user) =>
            ids.includes(user._id) ? { ...user, ...updates } : user,
          ),
        );
        for (const user of updatedUsers) {
          await updateItem(user._id, { ...user, id: user._id });
        }
        await fetchUsers();
      });
    },
    [executeAsync, updateItem, fetchUsers, users],
  );

  // Apply filters when users or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    // Data
    users,
    filteredUsers,
    statistics,
    filters,
    loading,
    error,

    // Methods
    fetchUsers,
    fetchUserById,
    fetchCurrentUser,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    getUsersByRole,
    updatePassword,
    updateUserRole,
    activateUser,
    deactivateUser,
    bulkUpdateUsers,

    // Filter methods
    updateFilter,
    resetFilters,
  };
};
