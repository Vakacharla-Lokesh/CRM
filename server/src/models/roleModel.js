import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      trim: true,
      minlength: [2, "Role name must be at least 2 characters"],
      maxlength: [50, "Role name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    permissions: {
      type: [String],
      required: true,
      validate: {
        validator: function (permissions) {
          return permissions.length > 0;
        },
        message: "Role must have at least one permission",
      },
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant ID is required"],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSystemRole: {
      type: Boolean,
      default: false,
      comment: "System roles cannot be deleted or modified by admins",
    },
  },
  {
    timestamps: true,
  },
);

// Compound index: unique role name per tenant
roleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

// Index for fast permission lookups
roleSchema.index({ permissions: 1 });

// Virtual for role display
roleSchema.virtual("displayName").get(function () {
  return (
    this.name.charAt(0).toUpperCase() + this.name.slice(1).replace(/_/g, " ")
  );
});

// Pre-save validation: check permissions exist in preset
roleSchema.pre("save", async function (next) {
  const { PERMISSION_MAP } = await import("./permissionPresets.js");
  const allPermissions = Object.values(PERMISSION_MAP).flat();

  const invalidPermissions = this.permissions.filter(
    (perm) => !allPermissions.includes(perm),
  );

  if (invalidPermissions.length > 0) {
    throw new Error(`Invalid permissions: ${invalidPermissions.join(", ")}`);
  }
});

// Static method: find by name and tenant
roleSchema.statics.findByNameAndTenant = function (name, tenantId) {
  return this.findOne({ name, tenantId, isActive: true });
};

// Static method: get default role for tenant
roleSchema.statics.getDefaultRole = function (tenantId) {
  return this.findOne({
    tenantId,
    name: "user",
    isSystemRole: true,
  });
};

const Role = mongoose.model("Role", roleSchema);

export default Role;
