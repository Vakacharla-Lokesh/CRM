import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import tenantModel from "../../tenants/models/tenantModel.js";
import AppError from "../../../utils/appError.js";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

// Helper function to add tenantName to user object
const addTenantNameToUser = async (userObj) => {
  if (!userObj.tenantId) return userObj;
  const tenant = await tenantModel.findById(userObj.tenantId).select("name");
  return {
    ...userObj,
    tenantName: tenant?.name || null,
  };
};

export const getAllUsers = wrapServiceFn(
  async (filter = {}, { limit = 20, cursor, excludeUserId } = {}) => {
    if (!filter.role) {
      filter.role = { $ne: "super_admin" };
    }

    if (cursor) {
      const lastId = Buffer.from(cursor, "base64").toString("utf8");
      filter._id = {
        ...(filter._id && typeof filter._id === "object" ? filter._id : {}),
        $gt: lastId,
      };
    }

    if (excludeUserId) {
      filter._id = {
        ...(filter._id && typeof filter._id === "object" ? filter._id : {}),
        $ne: excludeUserId,
      };
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

    return { users, nextCursor, hasNextPage };
  },
);

export const getUserById = wrapServiceFn(async (id) => {
  const user = await userModel.findById(id);
  if (!user || user.role === "super_admin")
    throw new AppError("User not found", 404);
  const userObject = user.toObject();
  delete userObject.password;
  return await addTenantNameToUser(userObject);
});

export const createUser = wrapServiceFn(async (userData) => {
  const { password, ...rest } = userData;

  const existingUser = await userModel.findOne({ email: rest.email });
  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  if (userData.role === "super_admin") {
    throw new AppError("Cannot create user with super_admin role", 403);
  }

  const user = await userModel.create({ ...rest, password });

  const userObject = user.toObject();
  delete userObject.password;
  return await addTenantNameToUser(userObject);
});

export const updateUser = wrapServiceFn(
  async (id, updateData, lastKnownUpdatedAt) => {
    const { password, tenantId: _tenantId, ...rest } = updateData;

    const user = await userModel.findById(id);
    if (!user) throw new AppError("User not found", 404);

    if (lastKnownUpdatedAt) {
      const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
      const serverTimestamp = new Date(user.updatedAt).getTime();

      if (clientTimestamp !== serverTimestamp) {
        throw new AppError(
          "This user was modified by someone else. Please refresh and try again.",
          409,
        );
      }
    }

    if (password && password.length > 0) {
      rest.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await userModel.findByIdAndUpdate(id, rest, {
      new: true,
      runValidators: true,
    });

    const userObject = updatedUser.toObject();
    delete userObject.password;

    return await addTenantNameToUser(userObject);
  },
);

export const deleteUser = wrapServiceFn(async (id) => {
  const user = await userModel.findById(id);
  if (!user) throw new AppError("User not found", 404);

  if (!user.isActive) {
    throw new AppError("User is already inactive", 400);
  }

  await userModel.findByIdAndUpdate(id, { isActive: false });
});

export const getUsersByTenant = wrapServiceFn(async (tenantId) => {
  return userModel.find({
    tenantId,
    isActive: true,
    role: { $ne: "super_admin" },
  });
});

export const updateUserRole = wrapServiceFn(async (id, role) => {
  const user = await userModel.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true },
  );
  if (!user) throw new AppError("User not found", 404);

  const userObject = user.toObject();
  delete userObject.password;
  return await addTenantNameToUser(userObject);
});

export const getCurrentUser = wrapServiceFn(async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const userObject = user.toObject();
  delete userObject.password;
  return await addTenantNameToUser(userObject);
});

export const searchUsers = wrapServiceFn(async (filter, q) => {
  if (!q) throw new AppError("Search query is required", 400);

  const searchRegex = new RegExp(q, "i");

  return userModel.find({
    ...filter,
    role: { $ne: "super_admin" },
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { mobile: searchRegex },
    ],
  });
});

export const getUserStats = wrapServiceFn(async (filter) => {
  const statsFilter = { ...filter, role: { $ne: "super_admin" } };

  const totalUsers = await userModel.countDocuments(statsFilter);
  const activeUsers = await userModel.countDocuments({ ...statsFilter });

  const usersByRole = await userModel.aggregate([
    { $match: statsFilter },
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    totalUsers,
    activeUsers: activeUsers || totalUsers,
    usersByRole: usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };
});

export const updatePassword = wrapServiceFn(
  async (id, oldPassword, newPassword) => {
    const user = await userModel.findById(id).select("+password");
    if (!user) throw new AppError("User not found", 404);

    if (oldPassword && user.password) {
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        throw new AppError("Invalid old password", 401);
      }
    }

    user.password = newPassword;
    await user.save();
  },
);

export const updateProfile = wrapServiceFn(async (id, profileData) => {
  const { name, firstName, lastName, email, phone, department, position } =
    profileData;
  const updateData = {};

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

  const user = await userModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError("User not found", 404);

  const userObject = user.toObject();
  delete userObject.password;
  return await addTenantNameToUser(userObject);
});

export const getUserPermissions = wrapServiceFn(async (id) => {
  const user = await userModel.findById(id);
  if (!user) throw new AppError("User not found", 404);

  return {
    role: user.role,
    permissions: user.getPermissionsArray(),
  };
});

export const assignRoleToUser = wrapServiceFn(async (id, permissions, role) => {
  if (!Array.isArray(permissions)) {
    throw new AppError("permissions must be an array of strings", 400);
  }

  const { ALL_PERMISSIONS } =
    await import("../../../utils/permissionPresets.js");
  const invalid = permissions.filter((p) => !ALL_PERMISSIONS.includes(p));
  if (invalid.length > 0) {
    throw new AppError(`Invalid permissions: ${invalid.join(", ")}`, 400);
  }

  const permissionsMap = Object.fromEntries(permissions.map((p) => [p, true]));

  if (role === "super_admin") {
    throw new AppError("Cannot assign super_admin role via this endpoint", 403);
  }

  const updateData = { permissions: permissionsMap };
  if (role) updateData.role = role;

  const user = await userModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError("User not found", 404);

  return {
    userId: user._id,
    role: user.role,
    permissions: user.getPermissionsArray(),
  };
});

export const activateUser = wrapServiceFn(async (id) => {
  const user = await userModel.findById(id);
  if (!user) throw new AppError("User not found", 404);

  if (user.isActive) {
    throw new AppError("User is already active", 400);
  }

  const updatedUser = await userModel.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true },
  );

  const userObject = updatedUser.toObject();
  delete userObject.password;
  return await addTenantNameToUser(userObject);
});

export const deactivateUser = wrapServiceFn(async (id) => {
  const user = await userModel.findById(id);
  if (!user) throw new AppError("User not found", 404);

  if (!user.isActive) {
    throw new AppError("User is already inactive", 400);
  }

  const updatedUser = await userModel.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );

  const userObject = updatedUser.toObject();
  delete userObject.password;
  return await addTenantNameToUser(userObject);
});
