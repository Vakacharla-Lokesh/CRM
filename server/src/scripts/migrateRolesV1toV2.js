import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/userModel.js";
import Role from "../models/roleModel.js";
import Tenant from "../models/tenantModel.js";
import { DEFAULT_ROLE_PERMISSIONS } from "../models/permissionPresets.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Migration Script: Convert role-based system to roleId-based system
 *
 * Steps:
 * 1. For each tenant, create 3 default roles (user, admin, super_admin)
 * 2. For each user, set roleId based on their current role string
 * 3. Verify no data loss
 */

const migrateRoles = async () => {
  try {
    console.log("🚀 Starting RBAC v1 → v2 Migration...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get all tenants
    const tenants = await Tenant.find({ isActive: true });
    console.log(`📊 Found ${tenants.length} active tenants\n`);

    let totalRolesCreated = 0;
    let totalUsersUpdated = 0;

    for (const tenant of tenants) {
      console.log(`\n🏢 Processing tenant: ${tenant.name} (${tenant._id})`);

      // Create default roles for tenant
      const roleMap = {};

      for (const [roleName, permissions] of Object.entries(
        DEFAULT_ROLE_PERMISSIONS,
      )) {
        // Check if role already exists
        let role = await Role.findOne({
          tenantId: tenant._id,
          name: roleName,
        });

        if (!role) {
          role = await Role.create({
            name: roleName,
            description: `Default ${roleName.replace("_", " ")} role`,
            permissions,
            tenantId: tenant._id,
            isSystemRole: true,
            isActive: true,
          });
          totalRolesCreated++;
          console.log(`  ✅ Created role: ${roleName}`);
        } else {
          console.log(`  ⏭️  Role already exists: ${roleName}`);
        }

        roleMap[roleName] = role._id;
      }

      // Update users for this tenant
      const users = await User.find({ tenantId: tenant._id });
      console.log(`  👤 Updating ${users.length} users...`);

      for (const user of users) {
        if (!user.roleId) {
          const roleId = roleMap[user.role];

          if (roleId) {
            user.roleId = roleId;
            await user.save();
            totalUsersUpdated++;
          } else {
            console.warn(
              `  ⚠️  No roleId mapping for user ${user.userEmail} with role ${user.role}`,
            );
          }
        }
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Migration Complete!");
    console.log(`📊 Roles Created: ${totalRolesCreated}`);
    console.log(`👤 Users Updated: ${totalUsersUpdated}`);
    console.log("=".repeat(50) + "\n");

    // Verification
    const usersWithoutRoleId = await User.countDocuments({
      roleId: { $exists: false },
    });

    if (usersWithoutRoleId > 0) {
      console.warn(
        `⚠️  WARNING: ${usersWithoutRoleId} users still missing roleId`,
      );
    } else {
      console.log("✅ All users have roleId assigned\n");
    }

    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration Error:", error);
    process.exit(1);
  }
};

// Run migration
migrateRoles();
