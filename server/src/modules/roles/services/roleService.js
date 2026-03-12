import roleModel from "../models/roleModel.js";
import AppError from "../../../utils/appError.js";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

export const getAllRoles = wrapServiceFn(async (tenantId) => {
  return roleModel.find({ tenantId }).sort({ name: 1 });
});

export const getRoleById = wrapServiceFn(async (id, tenantId) => {
  const role = await roleModel.findOne({ _id: id, tenantId });
  if (!role) throw new AppError("Role not found", 404);
  return role;
});

export const createRole = wrapServiceFn(async (tenantId, data) => {
  const existing = await roleModel.findOne({
    tenantId,
    name: new RegExp(`^${data.name}$`, "i"),
  });
  if (existing) throw new AppError("A role with this name already exists", 409);

  return roleModel.create({ tenantId, ...data });
});

export const updateRole = wrapServiceFn(async (id, tenantId, data) => {
  if (data.name) {
    const conflict = await roleModel.findOne({
      tenantId,
      name: new RegExp(`^${data.name}$`, "i"),
      _id: { $ne: id },
    });
    if (conflict)
      throw new AppError("A role with this name already exists", 409);
  }

  const role = await roleModel.findOneAndUpdate({ _id: id, tenantId }, data, {
    new: true,
    runValidators: true,
  });
  if (!role) throw new AppError("Role not found", 404);
  return role;
});

export const deleteRole = wrapServiceFn(async (id, tenantId) => {
  const role = await roleModel.findOneAndDelete({ _id: id, tenantId });
  if (!role) throw new AppError("Role not found", 404);
});
