import userModel from "../../users/models/userModel.js";
import roundRobinPointerModel from "../models/roundRobinPointerModel.js";

export const getNextAssignee = async (tenantId) => {
  const activeUsers = await userModel
    .find({ tenantId, isActive: true, role: { $in: ["user", "admin"] } })
    .select("_id")
    .sort({ createdAt: 1 })
    .lean();

  if (!activeUsers.length) {
    console.warn(`[RoundRobin] No active users for tenant ${tenantId}`);
    return null;
  }

  const total = activeUsers.length;

  const pointer = await roundRobinPointerModel.findOneAndUpdate(
    { tenantId },
    { $inc: { lastAssignedIndex: 1 } },
    { new: true, upsert: true },
  );

  const index = pointer.lastAssignedIndex % total;
  const assignedUser = activeUsers[index];
  return assignedUser._id;
};
