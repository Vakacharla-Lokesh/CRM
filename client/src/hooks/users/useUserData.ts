import { useState, useCallback, useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { userService } from "@/services/userService.ts";
import { useIndexedDB } from "@/hooks/useIndexedDB";
import type { CreateUserDTO, User, UserRole } from "@/types";

const PAGE_LIMIT = 20;

interface UserFilters {
  role: UserRole | "";
  status: "active" | "inactive" | "";
  search: string;
}

export const useUserData = (tenantId?: string) => {
  const queryClient = useQueryClient();
  const { updateItem, deleteItem, getAll } = useIndexedDB("users");

  const [filters, setFilters] = useState<UserFilters>({
    role: "",
    status: "",
    search: "",
  });

  const {
    data,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "users-list",
      {
        tenantId: tenantId ?? null,
        role: filters.role,
        status: filters.status,
        search: filters.search,
      },
    ],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      if (!navigator.onLine) {
        const cached = (await getAll()) as unknown as User[];
        return { users: cached, nextCursor: null, hasNextPage: false };
      }

      if (tenantId) {
        const users = await userService.getUsersByTenant(tenantId);
        return { users, nextCursor: null, hasNextPage: false };
      }

      const page = await userService.getAllUsers({
        cursor: pageParam ?? undefined,
        limit: PAGE_LIMIT,
        role: filters.role || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined,
      });

      for (const user of page.users) {
        try {
          await updateItem(user._id, { ...user, id: user._id });
        } catch (e) {
          console.warn("Failed to cache user in IndexedDB:", e);
        }
      }

      return page;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  });

  const allUsers: User[] = useMemo(
    () => data?.pages.flatMap((page) => page.users) ?? [],
    [data],
  );

  const error = queryError instanceof Error ? queryError : null;

  const filteredUsers = useMemo(() => {
    // role, status, and search are now filtered server-side
    return [...allUsers];
  }, [allUsers]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !loadingMore) {
      fetchNextPage();
    }
  }, [hasNextPage, loadingMore, fetchNextPage]);

  const fetchUsers = useCallback(() => {
    refetch();
  }, [refetch]);

  const fetchUserByTenant = useCallback(
    (_id: string) => {
      refetch();
    },
    [refetch],
  );

  const fetchUserById = useCallback(async (id: string) => {
    return userService.getUserById(id);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    return userService.getCurrentUser();
  }, []);

  const createMutation = useMutation({
    mutationFn: (userData: Partial<User>) => userService.createUser(userData),
    onSuccess: (newUser) => {
      updateItem(newUser._id, { ...newUser, id: newUser._id }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
      lastKnownUpdatedAt,
    }: {
      id: string;
      updates: Partial<User>;
      lastKnownUpdatedAt?: Date;
    }) => userService.updateUser(id, updates, lastKnownUpdatedAt),
    onSuccess: (updated) => {
      updateItem(updated._id, { ...updated, id: updated._id }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
    },
    onError: (err: unknown) => {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        toast.error(
          "This user was modified by someone else. Please refresh and try again.",
        );
        queryClient.invalidateQueries({ queryKey: ["users-list"] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (_, id) => {
      deleteItem(id).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      userService.updateRole(id, role),
    onSuccess: (updated) => {
      updateItem(updated._id, { ...updated, id: updated._id }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
    },
  });

  const createUser = useCallback(
    (userData: CreateUserDTO) =>
      createMutation.mutateAsync(userData as unknown as Partial<User>),
    [createMutation],
  );

  const updateUser = useCallback(
    (id: string, updates: CreateUserDTO) => {
      const cachedUser = allUsers.find((u) => u._id === id);
      return updateMutation.mutateAsync({
        id,
        updates: updates as unknown as Partial<User>,
        lastKnownUpdatedAt: cachedUser?.updatedAt,
      });
    },
    [updateMutation, allUsers],
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
    filters,
    loading,
    error,

    // Pagination
    hasNextPage: hasNextPage ?? false,
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
