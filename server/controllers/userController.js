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
      $or: [{ userEmail: userData.userEmail }, { mobile: userData.mobile }],
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

    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

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
