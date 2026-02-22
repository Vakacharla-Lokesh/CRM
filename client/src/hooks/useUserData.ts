import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
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

  const statistics = useMemo(() => {
    const stats: UserStatistics = {
      total: users.length,
      byRole: {},
      active: 0,
      inactive: 0,
    };

    users.forEach((user) => {
      stats.byRole[user.role] = (stats.byRole[user.role] ?? 0) + 1;

      if (user.isActive !== false) {
        stats.active += 1;
      } else {
        stats.inactive += 1;
      }
    });

    return stats;
  }, [users]);

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
      const page = await userService.getAllUsers({ limit: 20 });
      setUsers(page.users);
      setFilteredUsers(page.users);
      setNextCursor(page.nextCursor);
      setHasNextPage(page.hasNextPage);

      for (const user of page.users) {
        await updateItem(user._id, { ...user, id: user._id });
      }

      return page.users;
    });
  }, [executeAsync, updateItem]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const page = await userService.getAllUsers({
        cursor: nextCursor,
        limit: 20,
      });
      setUsers((prev) => [...prev, ...page.users]);
      setNextCursor(page.nextCursor);
      setHasNextPage(page.hasNextPage);

      for (const user of page.users) {
        await updateItem(user._id, { ...user, id: user._id });
      }
      setLoadingMore(false);
    } catch (error) {
      console.error("Error loading more users:", error);
      setLoadingMore(false);
    }
  }, [hasNextPage, loadingMore, nextCursor, updateItem]);

  const fetchUserById = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        const user = await userService.getUserById(id);
        return user;
      });
    },
    [executeAsync],
  );

  const fetchUserByTenant = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        const data = await userService.getUsersByTenant(id);
        setUsers(data);
        setFilteredUsers(data);

        for (const user of data) {
          await updateItem(user._id, { ...user, id: user._id });
        }

        return data;
      });
    },
    [executeAsync, updateItem],
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
        return newUser;
      });
    },
    [executeAsync, updateItem],
  );

  const updateUser = useCallback(
    async (id: string, updates: Partial<User>) => {
      return executeAsync(async () => {
        const updated = await userService.updateUser(id, updates);
        setUsers((prev) =>
          prev.map((user) => (user._id === id ? updated : user)),
        );
        await updateItem(id, { ...updated, id: updated._id });
        return updated;
      });
    },
    [executeAsync, updateItem],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        await userService.deleteUser(id);
        setUsers((prev) => prev.filter((user) => user._id !== id));
        await deleteItem(id);
      });
    },
    [executeAsync, deleteItem],
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
        return updated;
      });
    },
    [executeAsync, updateItem],
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
    fetchUserByTenant,
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

    nextCursor,
    hasNextPage,
    loadingMore,
    loadMore,
  };
};
