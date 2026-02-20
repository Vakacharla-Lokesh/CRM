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
  const { updateItem, deleteItem } = useIndexedDB("users");

  const calculateStatistics = useCallback((usersData: User[]) => {
    const stats: UserStatistics = {
      total: usersData.length,
      byRole: {},
      active: 0,
      inactive: 0,
    };

    usersData.forEach((user) => {
      stats.byRole[user.role] = (stats.byRole[user.role] ?? 0) + 1;

      if (user.isActive !== false) {
        stats.active += 1;
      } else {
        stats.inactive += 1;
      }
    });

    setStatistics(stats);
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...users];

    if (filters.role) {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    if (filters.status) {
      if (filters.status === "active") {
        filtered = filtered.filter((user) => user.isActive !== false);
      } else if (filters.status === "inactive") {
        filtered = filtered.filter((user) => user.isActive === false);
      }
    }

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

  const fetchUsers = useCallback(async () => {
    return executeAsync(async () => {
      const data = await userService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
      calculateStatistics(data);

      for (const user of data) {
        await updateItem(user._id, { ...user, id: user._id });
      }

      return data;
    });
  }, [executeAsync, updateItem, calculateStatistics]);

  const fetchUserById = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        const user = await userService.getUserById(id);
        return user;
      });
    },
    [executeAsync],
  );

  const fetchCurrentUser = useCallback(async () => {
    return executeAsync(async () => {
      const user = await userService.getCurrentUser();
      return user;
    });
  }, [executeAsync]);

  const createUser = useCallback(
    async (userData: Partial<User>) => {
      return executeAsync(async () => {
        const newUser = await userService.createUser(userData);
        setUsers((prev) => [...prev, newUser]);
        await updateItem(newUser._id, { ...newUser, id: newUser._id });
        await fetchUsers();
        return newUser;
      });
    },
    [executeAsync, updateItem, fetchUsers],
  );

  const updateUser = useCallback(
    async (id: string, updates: Partial<User>) => {
      return executeAsync(async () => {
        const updated = await userService.updateUser(id, updates);
        setUsers((prev) =>
          prev.map((user) => (user._id === id ? updated : user)),
        );
        await updateItem(id, { ...updated, id: updated._id });
        await fetchUsers();
        return updated;
      });
    },
    [executeAsync, updateItem, fetchUsers],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        await userService.deleteUser(id);
        setUsers((prev) => prev.filter((user) => user._id !== id));
        await deleteItem(id);
        await fetchUsers();
      });
    },
    [executeAsync, deleteItem, fetchUsers],
  );

  const searchUsers = useCallback(
    async (query: string) => {
      return executeAsync(async () => {
        const results = await userService.searchUsers(query);
        return results;
      });
    },
    [executeAsync],
  );

  const getUsersByRole = useCallback(
    async (role: UserRole) => {
      return executeAsync(async () => {
        const results = await userService.getUsersByRole(role);
        return results;
      });
    },
    [executeAsync],
  );

  const updatePassword = useCallback(
    async (id: string, oldPassword: string, newPassword: string) => {
      return executeAsync(async () => {
        await userService.updatePassword(id, { oldPassword, newPassword });
      });
    },
    [executeAsync],
  );

  const updateUserRole = useCallback(
    async (id: string, role: UserRole) => {
      return executeAsync(async () => {
        const updated = await userService.updateRole(id, role);
        setUsers((prev) =>
          prev.map((user) => (user._id === id ? updated : user)),
        );
        await updateItem(id, { ...updated, id: updated._id });
        await fetchUsers();
        return updated;
      });
    },
    [executeAsync, updateItem, fetchUsers],
  );

  const updateFilter = useCallback((key: keyof UserFilters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      role: "",
      status: "",
      search: "",
    });
    setFilteredUsers(users);
  }, [users]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    
    // Filter methods
    updateFilter,
    resetFilters,
  };
};
