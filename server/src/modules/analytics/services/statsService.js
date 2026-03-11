import userModel from "../../users/models/userModel.js";
import tenantModel from "../../tenants/models/tenantModel.js";
import mongoose from "mongoose";

export const getUsersStatsService = async (tenantFilter) => {
  const baseFilter = { ...tenantFilter };

  const [totalUsers, activeUsers, inactiveUsers, adminsCount] =
    await Promise.all([
      userModel.countDocuments(baseFilter),
      userModel.countDocuments({ ...baseFilter, isActive: true }),
      userModel.countDocuments({ ...baseFilter, isActive: false }),
      userModel.countDocuments({
        ...baseFilter,
        role: { $in: ["admin", "super_admin"] },
      }),
    ]);

  return { totalUsers, activeUsers, inactiveUsers, adminsCount };
};

export const getTenantsStatsService = async () => {
  const [totalTenants, activeTenants, suspendedTenants] = await Promise.all([
    tenantModel.countDocuments(),
    tenantModel.countDocuments({ isActive: true }),
    tenantModel.countDocuments({ isActive: false }),
  ]);

  return { totalTenants, activeTenants, suspendedTenants };
};
