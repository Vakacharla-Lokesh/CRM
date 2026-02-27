import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/AppError.js";

// Get all users
export const getAllUsers = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};
  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

  if (cursor) {
    const lastId = Buffer.from(cursor, "base64").toString("utf8");
    filter._id = { $gt: lastId };
  }

  const users = await userModel
    .find({ ...filter, isActive: true })
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

  if (!user) throw new AppError("User not found", 404);

  res.json({ user });
});

// Create a new user
export const createUser = asyncCatch(async (req, res) => {
  const { password, ...userData } = req.body;

  // Check if user already exists
  const existingUser = await userModel.findOne({
    userEmail: userData.userEmail,
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
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { userEmail: searchRegex },
      { mobile: searchRegex },
    ],
  });

  res.json(users);
});

// Get user statistics
export const getUserStats = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};

  const totalUsers = await userModel.countDocuments(filter);
  const activeUsers = await userModel.countDocuments({
    ...filter,
    // Add your active user criteria here
  });

  const usersByRole = await userModel.aggregate([
    { $match: filter },
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

  const user = await userModel.findOne({ userEmail: email });

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

  if (email) updateData.userEmail = email;
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
  const user = await userModel.findById(req.params.id);

  if (!user) throw new AppError("User not found", 404);

  // Define permissions based on role
  const permissionsMap = {
    super_admin: [
      "users:read",
      "users:write",
      "users:delete",
      "tenants:read",
      "tenants:write",
      "tenants:delete",
      "leads:read",
      "leads:write",
      "leads:delete",
      "deals:read",
      "deals:write",
      "deals:delete",
      "organizations:read",
      "organizations:write",
      "organizations:delete",
    ],
    admin: [
      "users:read",
      "users:write",
      "leads:read",
      "leads:write",
      "leads:delete",
      "deals:read",
      "deals:write",
      "deals:delete",
      "organizations:read",
      "organizations:write",
      "organizations:delete",
    ],
    user: [
      "leads:read",
      "leads:write",
      "deals:read",
      "deals:write",
      "organizations:read",
    ],
  };

  const permissions = permissionsMap[user.role] || [];
  res.json(permissions);
});
