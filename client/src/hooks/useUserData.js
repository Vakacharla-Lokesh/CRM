import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services';
import { useAsync } from './useAsync';
import { useIndexedDB } from './useIndexedDB';

/**
 * User Data Management Hook
 * Handles all user-related operations including CRUD, filtering, and statistics
 * 
 * @returns {Object} User data and operations
 */
export const useUserData = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    byRole: {},
    active: 0,
    inactive: 0,
  });
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
  });

  const { execute: executeAsync, loading, error } = useAsync();
  const { addItem, updateItem, deleteItem, getAll } = useIndexedDB('users');

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
        await addItem(user);
      }
      
      return data;
    });
  }, [executeAsync, addItem]);

  /**
   * Fetch single user by ID
   * @param {string} id - User ID
   */
  const fetchUserById = useCallback(async (id) => {
    return executeAsync(async () => {
      const user = await userService.getUserById(id);
      return user;
    });
  }, [executeAsync]);

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
   * @param {Object} userData - User data
   */
  const createUser = useCallback(async (userData) => {
    return executeAsync(async () => {
      const newUser = await userService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      await addItem(newUser);
      await fetchUsers(); // Refresh to recalculate stats
      return newUser;
    });
  }, [executeAsync, addItem, fetchUsers]);

  /**
   * Update existing user
   * @param {string} id - User ID
   * @param {Object} updates - Updated data
   */
  const updateUser = useCallback(async (id, updates) => {
    return executeAsync(async () => {
      const updated = await userService.updateUser(id, updates);
      setUsers(prev => prev.map(user => user.id === id ? updated : user));
      await updateItem(id, updated);
      await fetchUsers(); // Refresh to recalculate stats
      return updated;
    });
  }, [executeAsync, updateItem, fetchUsers]);

  /**
   * Delete user
   * @param {string} id - User ID
   */
  const deleteUser = useCallback(async (id) => {
    return executeAsync(async () => {
      await userService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      await deleteItem(id);
      await fetchUsers(); // Refresh to recalculate stats
    });
  }, [executeAsync, deleteItem, fetchUsers]);

  /**
   * Search users
   * @param {string} query - Search query
   */
  const searchUsers = useCallback(async (query) => {
    return executeAsync(async () => {
      const results = await userService.searchUsers(query);
      setFilteredUsers(results);
      return results;
    });
  }, [executeAsync]);

  /**
   * Get users by role
   * @param {string} role - User role
   */
  const getUsersByRole = useCallback(async (role) => {
    return executeAsync(async () => {
      const results = await userService.getUsersByRole(role);
      return results;
    });
  }, [executeAsync]);

  /**
   * Update user password
   * @param {string} id - User ID
   * @param {string} oldPassword - Old password
   * @param {string} newPassword - New password
   */
  const updatePassword = useCallback(async (id, oldPassword, newPassword) => {
    return executeAsync(async () => {
      await userService.updatePassword(id, { oldPassword, newPassword });
    });
  }, [executeAsync]);

  /**
   * Update user role
   * @param {string} id - User ID
   * @param {string} role - New role
   */
  const updateUserRole = useCallback(async (id, role) => {
    return executeAsync(async () => {
      const updated = await userService.updateRole(id, role);
      setUsers(prev => prev.map(user => user.id === id ? updated : user));
      await updateItem(id, updated);
      await fetchUsers(); // Refresh to recalculate stats
      return updated;
    });
  }, [executeAsync, updateItem, fetchUsers]);

  /**
   * Activate user
   * @param {string} id - User ID
   */
  const activateUser = useCallback(async (id) => {
    return executeAsync(async () => {
      const updated = await userService.activateUser(id);
      setUsers(prev => prev.map(user => user.id === id ? updated : user));
      await updateItem(id, updated);
      await fetchUsers(); // Refresh to recalculate stats
      return updated;
    });
  }, [executeAsync, updateItem, fetchUsers]);

  /**
   * Deactivate user
   * @param {string} id - User ID
   */
  const deactivateUser = useCallback(async (id) => {
    return executeAsync(async () => {
      const updated = await userService.deactivateUser(id);
      setUsers(prev => prev.map(user => user.id === id ? updated : user));
      await updateItem(id, updated);
      await fetchUsers(); // Refresh to recalculate stats
      return updated;
    });
  }, [executeAsync, updateItem, fetchUsers]);

  /**
   * Apply filters to users
   */
  const applyFilters = useCallback(() => {
    let filtered = [...users];

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.status) {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
    calculateStatistics(filtered);
  }, [users, filters]);

  /**
   * Calculate statistics from users
   * @param {Array} usersData - Array of users
   */
  const calculateStatistics = (usersData) => {
    const stats = {
      total: usersData.length,
      byRole: {},
      active: 0,
      inactive: 0,
    };

    usersData.forEach(user => {
      // Count by role
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;

      // Count active/inactive
      if (user.isActive) {
        stats.active++;
      } else {
        stats.inactive++;
      }
    });

    setStatistics(stats);
  };

  /**
   * Update filters
   * @param {Object} newFilters - Filter updates
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    setFilters({
      role: '',
      status: '',
      search: '',
    });
    setFilteredUsers(users);
    calculateStatistics(users);
  }, [users]);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadFromCache = async () => {
      const cached = await getAll();
      if (cached && cached.length > 0) {
        setUsers(cached);
        setFilteredUsers(cached);
        calculateStatistics(cached);
      }
    };
    loadFromCache();
  }, [getAll]);

  return {
    // Data
    users,
    filteredUsers,
    statistics,
    filters,

    // State
    loading,
    error,

    // CRUD Operations
    fetchUsers,
    fetchUserById,
    fetchCurrentUser,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    getUsersByRole,

    // Specialized Operations
    updatePassword,
    updateUserRole,
    activateUser,
    deactivateUser,

    // Filter Operations
    updateFilters,
    resetFilters,
  };
};
