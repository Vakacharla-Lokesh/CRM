import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/AppError.js";
import Role from "../models/roleModel.js";

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

  if (!user || user.role === "super_admin") throw new AppError("User not found", 404);

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

// Get user permissions
export const getUserPermissions = asyncCatch(async (req, res) => {
  const user = await userModel.findById(req.params.id).populate("roleId");

  if (!user) throw new AppError("User not found", 404);

  // If roleId exists, return permissions from Role document
  if (user.roleId && user.roleId.permissions) {
    return res.json({
      role: user.roleId.name,
      roleId: user.roleId._id,
      permissions: user.roleId.permissions,
      isSystemRole: user.roleId.isSystemRole,
    });
  }

  // Fallback to legacy role-based permissions
  const { getLegacyRolePermissions } =
    await import("../models/permissionPresets.js");
  const permissions = getLegacyRolePermissions(user.role);

  res.json({
    role: user.role,
    roleId: null,
    permissions,
    isSystemRole: true,
    legacy: true,
  });
});

/**
 * Assign a role to a user (updated for dynamic RBAC)
 * @route PATCH /api/users/:id/role
 * @access Private (admin, super_admin)
 */
export const assignRoleToUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Validate role ID
    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID format",
      });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check tenant access
    if (
      req.user.role !== "super_admin" &&
      user.tenantId.toString() !== req.user.tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to modify this user",
      });
    }

    // Verify role exists and belongs to the same tenant
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    if (!role.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot assign an inactive role",
      });
    }

    // Ensure role belongs to the same tenant (unless super_admin)
    if (
      req.user.role !== "super_admin" &&
      role.tenantId.toString() !== user.tenantId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot assign a role from a different organization",
      });
    }

    // Update user's role
    user.roleId = roleId;
    await user.save();

    // Populate role details for response
    await user.populate("roleId", "name description permissions");

    res.status(200).json({
      success: true,
      message: "Role assigned successfully",
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.roleId,
          tenantId: user.tenantId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
