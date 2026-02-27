import * as roleService from "../services/roleService.js";

/**
 * Get all roles for the authenticated user's tenant.
 * @route GET /api/roles
 * @access Private (roles:read)
 */
export const getAllRoles = async (req, res, next) => {
  try {
    // super_admin without tenantId sees all roles
    const tenantId =
      req.user.role === "super_admin" && !req.user.tenantId
        ? null
        : req.user.tenantId;

    const roles = await roleService.getRolesByTenant(tenantId);

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single role by ID.
 * @route GET /api/roles/:id
 * @access Private (roles:read)
 */
export const getRoleById = async (req, res, next) => {
  try {
    const tenantId =
      req.user.role === "super_admin" ? null : req.user.tenantId;

    const role = await roleService.getRoleById(req.params.id, tenantId);

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new role.
 * @route POST /api/roles
 * @access Private (roles:write)
 */
export const createRole = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;

    const role = await roleService.createRole({
      tenantId: req.user.tenantId,
      name,
      description,
      permissions,
    });

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing role.
 * @route PUT /api/roles/:id
 * @access Private (roles:write)
 */
export const updateRole = async (req, res, next) => {
  try {
    const tenantId =
      req.user.role === "super_admin" ? null : req.user.tenantId;

    const role = await roleService.updateRole(
      req.params.id,
      tenantId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft-delete a role.
 * @route DELETE /api/roles/:id
 * @access Private (roles:delete)
 */
export const deleteRole = async (req, res, next) => {
  try {
    const tenantId =
      req.user.role === "super_admin" ? null : req.user.tenantId;

    await roleService.deleteRole(req.params.id, tenantId);

    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get permissions list for a specific role.
 * @route GET /api/roles/:id/permissions
 * @access Private (roles:read)
 */
export const getRolePermissions = async (req, res, next) => {
  try {
    const permissions = await roleService.getRolePermissions(req.params.id);

    res.status(200).json({
      success: true,
      data: { permissions },
    });
  } catch (error) {
    next(error);
  }
};
