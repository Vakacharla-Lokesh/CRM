import asyncCatch from "../utils/asyncCatch.js";
import * as userService from "../services/userService.js";

// Get all users
export const getAllUsers = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};
  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

  // Never expose super_admin users
  filter.role = { $ne: "super_admin" };

  // Server-side filters
  if (req.query.role) {
    if (req.query.role !== "super_admin") {
      filter.role = req.query.role;
    }
  }
  if (req.query.status === "active") {
    filter.isActive = { $ne: false };
  } else if (req.query.status === "inactive") {
    filter.isActive = false;
  }
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    filter.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
    ];
  }

  const { users, nextCursor, hasNextPage } =
    await userService.getAllUsers(filter, { limit, cursor });

  res.json({ count: users.length, users, nextCursor, hasNextPage });
});

// Get user by ID
export const getUserById = asyncCatch(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res.json({ user });
});

// Create a new user
export const createUser = asyncCatch(async (req, res) => {
  const user = await userService.createUser(req.body);

  res.status(201).json({
    message: "User created successfully",
    user,
  });
});

// Update user
export const updateUser = asyncCatch(async (req, res) => {
  const { lastKnownUpdatedAt, ...updates } = req.body;
  const user = await userService.updateUser(req.params.id, updates, lastKnownUpdatedAt);

  res.json({
    message: "User updated successfully",
    user,
  });
});

// Delete user
export const deleteUser = asyncCatch(async (req, res) => {
  await userService.deleteUser(req.params.id);

  res.json({ message: "User deactivated successfully" });
});

// Get users by tenant
export const getUsersByTenant = asyncCatch(async (req, res) => {
  const users = await userService.getUsersByTenant(req.params.tenantId);

  res.json({
    count: users.length,
    users,
  });
});

// Update user role (admin only)
export const updateUserRole = asyncCatch(async (req, res) => {
  const { role } = req.body;

  const user = await userService.updateUserRole(req.params.id, role);

  res.json({
    message: "User role updated successfully",
    user,
  });
});

// Get current user (authenticated user)
export const getCurrentUser = asyncCatch(async (req, res) => {
  const user = await userService.getCurrentUser(req.user.userId);

  res.json({ user });
});

// Search users
export const searchUsers = asyncCatch(async (req, res) => {
  const { q } = req.query;
  const filter = req.tenantFilter || {};

  const users = await userService.searchUsers(filter, q);

  res.json(users);
});

// Get user statistics
export const getUserStats = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};

  const stats = await userService.getUserStats(filter);

  res.json(stats);
});

// Update user password
export const updatePassword = asyncCatch(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  await userService.updatePassword(req.params.id, oldPassword, newPassword);

  res.json({ message: "Password updated successfully" });
});

// Send password reset email
export const sendPasswordReset = asyncCatch(async (req, res) => {
  // TODO: Implement actual password reset token generation and email sending
  // For now, just return success message
  res.json({
    message: "If an account exists, a password reset email has been sent",
  });
});

// Update user profile
export const updateProfile = asyncCatch(async (req, res) => {
  const user = await userService.updateProfile(req.params.id, req.body);

  res.json(user);
});

// Get user activity
export const getUserActivity = asyncCatch(async (req, res) => {
  // TODO: Implement actual activity logging system
  // For now, return empty array
  res.json([]);
});

export const getUserPermissions = asyncCatch(async (req, res) => {
  const { role, permissions } = await userService.getUserPermissions(
    req.params.id,
  );

  res.json({ role, permissions });
});

export const assignRoleToUser = asyncCatch(async (req, res) => {
  const { id } = req.params;
  const { permissions, role } = req.body;

  const data = await userService.assignRoleToUser(id, permissions, role);

  res.json({
    success: true,
    message: "Permissions updated successfully",
    data,
  });
});
