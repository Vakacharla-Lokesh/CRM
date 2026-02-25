import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService.ts";
import { useIndexedDB } from "./useIndexedDB";
import type { User, UserRole } from "../types";

const PAGE_LIMIT = 20;

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
  const queryClient = useQueryClient();
  const { updateItem, deleteItem, getAll } = useIndexedDB("users");

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [tenantId, setTenantId] = useState<string | null>(null);

  const [filters, setFilters] = useState<UserFilters>({
    role: "",
    status: "",
    search: "",
  });

  const {
    data: queryData,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["users", { tenantId }],
    queryFn: async () => {
      if (!navigator.onLine) {
        const cached = (await getAll()) as unknown as User[];
        return { users: cached, nextCursor: null, hasNextPage: false };
      }

      if (tenantId) {
        const data = await userService.getUsersByTenant(tenantId);
        return { users: data, nextCursor: null, hasNextPage: false };
      }

      const page = await userService.getAllUsers({ limit: PAGE_LIMIT });
      return page;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!queryData) return;
    const { users, nextCursor: cursor, hasNextPage: more } = queryData;

    setAllUsers(users);
    setNextCursor(cursor ?? null);
    setHasNextPage(more ?? false);

    users.forEach((user) => {
      updateItem(user._id, { ...user, id: user._id });
    });
  }, [queryData, updateItem]);

  const error = queryError instanceof Error ? queryError : null;

  const statistics = useMemo((): UserStatistics => {
    const stats: UserStatistics = {
      total: allUsers.length,
      byRole: {},
      active: 0,
      inactive: 0,
    };

    allUsers.forEach((user) => {
      stats.byRole[user.role] = (stats.byRole[user.role] ?? 0) + 1;
      if (user.isActive !== false) {
        stats.active += 1;
      } else {
        stats.inactive += 1;
      }
    });

    return stats;
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    let filtered = [...allUsers];

    if (filters.role) {
      filtered = filtered.filter((u) => u.role === filters.role);
    }

    if (filters.status) {
      if (filters.status === "active") {
        filtered = filtered.filter((u) => u.isActive !== false);
      } else {
        filtered = filtered.filter((u) => u.isActive === false);
      }
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.firstName?.toLowerCase().includes(searchLower) ?? false) ||
          (u.lastName?.toLowerCase().includes(searchLower) ?? false) ||
          (u.userEmail?.toLowerCase().includes(searchLower) ?? false),
      );
    }

    return filtered;
  }, [allUsers, filters]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const page = await userService.getAllUsers({
        cursor: nextCursor,
        limit: PAGE_LIMIT,
      });
      setAllUsers((prev) => [...prev, ...page.users]);
      setNextCursor(page.nextCursor ?? null);
      setHasNextPage(page.hasNextPage ?? false);
      for (const user of page.users) {
        await updateItem(user._id, { ...user, id: user._id });
      }
    } catch (err) {
      console.error("Error loading more users:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasNextPage, loadingMore, nextCursor, updateItem]);

  const fetchUsers = useCallback(() => {
    setTenantId(null);
    setAllUsers([]);
    setNextCursor(null);
    queryClient.invalidateQueries({ queryKey: ["users"] });
  }, [queryClient]);

  const fetchUserByTenant = useCallback((id: string) => {
    setTenantId(id);
    setAllUsers([]);
    setNextCursor(null);
  }, []);

  const fetchUserById = useCallback(async (id: string) => {
    return userService.getUserById(id);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    return userService.getCurrentUser();
  }, []);

  const createMutation = useMutation({
    mutationFn: (userData: Partial<User>) => userService.createUser(userData),
    onSuccess: async (newUser) => {
      setAllUsers((prev) => [...prev, newUser]);
      await updateItem(newUser._id, { ...newUser, id: newUser._id });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
      userService.updateUser(id, updates),
    onSuccess: async (updated) => {
      setAllUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? updated : u)),
      );
      await updateItem(updated._id, { ...updated, id: updated._id });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: async (_, id) => {
      setAllUsers((prev) => prev.filter((u) => u._id !== id));
      await deleteItem(id);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      userService.updateRole(id, role),
    onSuccess: async (updated) => {
      setAllUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? updated : u)),
      );
      await updateItem(updated._id, { ...updated, id: updated._id });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const createUser = useCallback(
    (userData: Partial<User>) => createMutation.mutateAsync(userData),
    [createMutation],
  );

  const updateUser = useCallback(
    (id: string, updates: Partial<User>) =>
      updateMutation.mutateAsync({ id, updates }),
    [updateMutation],
  );

  const deleteUser = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  );

  const searchUsers = useCallback(async (query: string) => {
    return userService.searchUsers(query);
  }, []);

  const getUsersByRole = useCallback(async (role: UserRole) => {
    return userService.getUsersByRole(role);
  }, []);

  const updatePassword = useCallback(
    async (id: string, oldPassword: string, newPassword: string) => {
      return userService.updatePassword(id, { oldPassword, newPassword });
    },
    [],
  );

  const updateUserRole = useCallback(
    (id: string, role: UserRole) =>
      updateRoleMutation.mutateAsync({ id, role }),
    [updateRoleMutation],
  );

  const updateFilter = useCallback((key: keyof UserFilters, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ role: "", status: "", search: "" });
  }, []);

  return {
    // Data
    users: allUsers,
    filteredUsers,
    statistics,
    filters,
    loading,
    error,

    // Pagination
    nextCursor,
    hasNextPage,
    loadingMore,
    loadMore,

    // Fetch methods
    fetchUsers,
    fetchUserById,
    fetchUserByTenant,
    fetchCurrentUser,

    // CRUD
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
