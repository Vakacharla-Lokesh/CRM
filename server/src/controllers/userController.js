import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/appError.js";

// Get all users
export const getAllUsers = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};
  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

  // Never expose super_admin users
  filter.role = { $ne: "super_admin" };

  // Server-side filters
  if (req.query.role) {
    // Only apply role filter if it isn't trying to fetch super_admin
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

  if (cursor) {
    const lastId = Buffer.from(cursor, "base64").toString("utf8");
    filter._id = { $gt: lastId };
  }

  const users = await userModel
    .find({ ...filter })
    .sort({ _id: 1 })
    .limit(limit + 1);

  const hasNextPage = users.length > limit;
  if (hasNextPage) users.pop();

  const nextCursor =
    hasNextPage && users.length > 0
      ? Buffer.from(users[users.length - 1]._id.toString()).toString("base64")
      : null;

  res.json({ count: users.length, users, nextCursor, hasNextPage });
});

// Get user by ID
export const getUserById = asyncCatch(async (req, res) => {
  const user = await userModel.findById(req.params.id);

  if (!user || user.role === "super_admin")
    throw new AppError("User not found", 404);

  res.json({ user });
});

// Create a new user
export const createUser = asyncCatch(async (req, res) => {
  const { password, ...userData } = req.body;

  // Check if user already exists
  const existingUser = await userModel.findOne({
    email: userData.email,
  });

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  // Create user
  const user = await userModel.create({
    ...userData,
    password,
  });

  // Convert to plain object and remove password
  const userObject = user.toObject();
  delete userObject.password;

  res.status(201).json({
    message: "User created successfully",
    user: userObject,
  });
});

// Update user
export const updateUser = asyncCatch(async (req, res) => {
  const { password, ...updateData } = req.body;

  // If password is being updated, hash it
  if (password) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  const user = await userModel.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new AppError("User not found", 404);

  // Convert to plain object and remove password
  const userObject = user.toObject();
  delete userObject.password;

  res.json({
    message: "User updated successfully",
    user: userObject,
  });
});

// Delete user
export const deleteUser = asyncCatch(async (req, res) => {
  const user = await userModel.findById(req.params.id);

  if (!user) throw new AppError("User not found", 404);

  if (!user.isActive) {
    throw new AppError("User is already inactive", 400);
  }

  await userModel.findByIdAndUpdate(req.params.id, { isActive: false });

  res.json({ message: "User deactivated successfully" });
});

// Get users by tenant
export const getUsersByTenant = asyncCatch(async (req, res) => {
  const users = await userModel.find({
    tenantId: req.params.tenantId,
    isActive: true,
    role: { $ne: "super_admin" },
  });

  res.json({
    count: users.length,
    users,
  });
});

// Update user role (admin only)
export const updateUserRole = asyncCatch(async (req, res) => {
  const { role } = req.body;

  const user = await userModel.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true },
  );

  if (!user) throw new AppError("User not found", 404);

  // Convert to plain object and remove password
  const userObject = user.toObject();
  delete userObject.password;

  res.json({
    message: "User role updated successfully",
    user: userObject,
  });
});

// Get current user (authenticated user)
export const getCurrentUser = asyncCatch(async (req, res) => {
  const user = await userModel.findById(req.user.userId);

  if (!user) throw new AppError("User not found", 404);

  // Convert to plain object and remove password
  const userObject = user.toObject();
  delete userObject.password;

  res.json({
    user: userObject,
  });
});

// Search users
export const searchUsers = asyncCatch(async (req, res) => {
  const { q } = req.query;

  if (!q) throw new AppError("Search query is required", 400);

  const filter = req.tenantFilter || {};
  const searchRegex = new RegExp(q, "i");

  const users = await userModel.find({
    ...filter,
    role: { $ne: "super_admin" },
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { mobile: searchRegex },
    ],
  });

  res.json(users);
});

// Get user statistics
export const getUserStats = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};

  const statsFilter = { ...filter, role: { $ne: "super_admin" } };

  const totalUsers = await userModel.countDocuments(statsFilter);
  const activeUsers = await userModel.countDocuments({
    ...statsFilter,
    // Add your active user criteria here
  });

  const usersByRole = await userModel.aggregate([
    { $match: statsFilter },
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = {
    totalUsers,
    activeUsers: activeUsers || totalUsers, // Fallback to total if no specific criteria
    usersByRole: usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };

  res.json(stats);
});

// Update user password
export const updatePassword = asyncCatch(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await userModel.findById(req.params.id).select("+password");

  if (!user) throw new AppError("User not found", 404);

  // Verify old password if provided
  if (oldPassword && user.password) {
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new AppError("Invalid old password", 401);
    }
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated successfully" });
});

// Send password reset email
export const sendPasswordReset = asyncCatch(async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email: email });

  if (!user) {
    // Don't reveal if user exists or not for security
    return res.json({
      message: "If an account exists, a password reset email has been sent",
    });
  }

  // TODO: Implement actual password reset token generation and email sending
  // For now, just return success message
  res.json({
    message: "If an account exists, a password reset email has been sent",
  });
});

// Update user profile
export const updateProfile = asyncCatch(async (req, res) => {
  const { name, firstName, lastName, email, phone, department, position } =
    req.body;
  const updateData = {};

  // Handle firstName and lastName directly, or parse from name
  if (firstName !== undefined) {
    updateData.firstName = firstName;
  } else if (name) {
    const nameParts = name.split(" ");
    updateData.firstName = nameParts[0];
  }

  if (lastName !== undefined) {
    updateData.lastName = lastName;
  } else if (name && !firstName) {
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      updateData.lastName = nameParts.slice(1).join(" ");
    }
  }

  if (email) updateData.email = email;
  if (phone) updateData.mobile = phone;
  if (department) updateData.department = department;
  if (position) updateData.position = position;

  const user = await userModel.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new AppError("User not found", 404);

  // Convert to plain object and remove password
  const userObject = user.toObject();
  delete userObject.password;

  res.json(userObject);
});

// Get user activity
export const getUserActivity = asyncCatch(async (req, res) => {
  // TODO: Implement actual activity logging system
  // For now, return empty array
  res.json([]);
});

export const getUserPermissions = asyncCatch(async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);

  const permissions = user.getPermissionsArray();

  res.json({
    role: user.role,
    permissions,
  });
});

export const assignRoleToUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions, role } = req.body;

    if (!Array.isArray(permissions)) {
      return next(new AppError("permissions must be an array of strings", 400));
    }

    const { ALL_PERMISSIONS } = await import("../models/permissionPresets.js");
    const invalid = permissions.filter((p) => !ALL_PERMISSIONS.includes(p));
    if (invalid.length > 0) {
      return next(
        new AppError(`Invalid permissions: ${invalid.join(", ")}`, 400),
      );
    }

    // Convert array → Map object
    const permissionsMap = Object.fromEntries(
      permissions.map((p) => [p, true]),
    );

    const updateData = { permissions: permissionsMap };
    if (role) updateData.role = role;

    const user = await userModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) return next(new AppError("User not found", 404));

    res.json({
      success: true,
      message: "Permissions updated successfully",
      data: {
        userId: user._id,
        role: user.role,
        permissions: user.getPermissionsArray(),
      },
    });
  } catch (err) {
    next(err);
  }
};
