import asyncCatch from "../../../utils/asyncCatch.js";
import * as roleService from "../services/roleService.js";

const getTenantId = (req) => {
  // Super admins can query roles for a specific tenant via ?tenantId=
  if (req.auth?.role === "super_admin" && req.query.tenantId) {
    return req.query.tenantId;
  }
  return req.tenantContext?.tenantId;
};

export const getAllRoles = asyncCatch(async (req, res) => {
  const roles = await roleService.getAllRoles(getTenantId(req));
  res.json({ count: roles.length, roles });
});

export const getRoleById = asyncCatch(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id, getTenantId(req));
  res.json({ role });
});

export const createRole = asyncCatch(async (req, res) => {
  const role = await roleService.createRole(getTenantId(req), req.body);
  res.status(201).json({ message: "Role created successfully", role });
});

export const updateRole = asyncCatch(async (req, res) => {
  const role = await roleService.updateRole(
    req.params.id,
    getTenantId(req),
    req.body,
  );
  res.json({ message: "Role updated successfully", role });
});

export const deleteRole = asyncCatch(async (req, res) => {
  await roleService.deleteRole(req.params.id, getTenantId(req));
  res.json({ message: "Role deleted successfully" });
});
