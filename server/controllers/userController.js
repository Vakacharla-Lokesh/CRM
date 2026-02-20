import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const users = await userModel.find(filter);

    res.json({
      count: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// Create a new user
export const createUser = async (req, res, next) => {
  try {
    const { password, ...userData } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({
      $or: [{ userEmail: userData.userEmail }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email or mobile already exists",
      });
    }

    // Hash password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Create user
    const user = await userModel.create({
      ...userData,
      ...(hashedPassword && { password: hashedPassword }),
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userEmail: user.userEmail,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;

    // If password is being updated, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await userModel.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userEmail: user.userEmail,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get users by tenant
export const getUsersByTenant = async (req, res, next) => {
  try {
    const users = await userModel.find({ tenantId: req.params.tenantId });

    res.json({
      count: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get current user (authenticated user)
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userEmail: user.userEmail,
        mobile: user.mobile,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Search users
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

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
  } catch (err) {
    next(err);
  }
};

// Get user statistics
export const getUserStats = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

// Update user password
export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await userModel.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password if provided
    if (oldPassword && user.password) {
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid old password" });
      }
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

// Send password reset email
export const sendPasswordReset = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, department, position } = req.body;
    const updateData = {};

    if (name) {
      const nameParts = name.split(" ");
      updateData.firstName = nameParts[0];
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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Get user activity
export const getUserActivity = async (req, res, next) => {
  try {
    // TODO: Implement actual activity logging system
    // For now, return empty array
    res.json([]);
  } catch (err) {
    next(err);
  }
};

// Get user permissions
export const getUserPermissions = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
  } catch (err) {
    next(err);
  }
};
