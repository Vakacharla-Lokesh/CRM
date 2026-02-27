import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/userModel.js";
import Role from "../models/roleModel.js";
import Tenant from "../models/tenantModel.js";
import { ALL_PERMISSIONS } from "../models/permissionPresets.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const GLOBAL_TENANT_NAME = "GLOBAL_SYSTEM";
const SYSTEM_ROLE_NAME = "system_admin";

/**
 * Migration Script: Create a GLOBAL_SYSTEM tenant for super_admin users
 *
 * Steps:
 * 1. Create (or find) the GLOBAL_SYSTEM tenant with isSystemTenant: true
 * 2. Create (or find) a system_admin role under that tenant with ALL permissions
 * 3. Update all super_admin users to reference both
 */
const migrateSuperAdminGlobalTenant = async () => {
  try {
    console.log("🚀 Starting Super Admin → Global Tenant Migration...\n");

    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected to MongoDB\n");

    // 1. Create or find GLOBAL_SYSTEM tenant
    let globalTenant = await Tenant.findOne({
      tenantName: GLOBAL_TENANT_NAME,
      isSystemTenant: true,
    });

    if (!globalTenant) {
      globalTenant = await Tenant.create({
        tenantName: GLOBAL_TENANT_NAME,
        email: "system@global.internal",
        mobile: "0000000000",
        isActive: true,
        isSystemTenant: true,
      });
      console.log(`✅ Created GLOBAL_SYSTEM tenant: ${globalTenant._id}`);
    } else {
      console.log(
        `⏭️  GLOBAL_SYSTEM tenant already exists: ${globalTenant._id}`,
      );
    }

    // 2. Create or find system_admin role under the global tenant
    let systemRole = await Role.findOne({
      tenantId: globalTenant._id,
      name: SYSTEM_ROLE_NAME,
    });

    if (!systemRole) {
      systemRole = await Role.create({
        name: SYSTEM_ROLE_NAME,
        description: "System-wide administrator with all permissions",
        permissions: ALL_PERMISSIONS,
        tenantId: globalTenant._id,
        isSystemRole: true,
        isActive: true,
      });
      console.log(`✅ Created system_admin role: ${systemRole._id}`);
    } else {
      // Ensure permissions are up to date
      systemRole.permissions = ALL_PERMISSIONS;
      await systemRole.save();
      console.log(
        `⏭️  system_admin role already exists: ${systemRole._id} (permissions synced)`,
      );
    }

    // 3. Update all super_admin users
    const superAdmins = await User.find({ role: "super_admin" });
    console.log(`\n👤 Found ${superAdmins.length} super_admin users\n`);

    let updated = 0;
    for (const user of superAdmins) {
      const needsUpdate =
        user.tenantId?.toString() !== globalTenant._id.toString() ||
        user.roleId?.toString() !== systemRole._id.toString();

      if (needsUpdate) {
        user.tenantId = globalTenant._id;
        user.roleId = systemRole._id;
        await user.save();
        updated++;
        console.log(`  ✅ Updated: ${user.userEmail}`);
      } else {
        console.log(`  ⏭️  Already migrated: ${user.userEmail}`);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Migration Complete!");
    console.log(`🏢 Global Tenant ID: ${globalTenant._id}`);
    console.log(`🔑 System Role ID: ${systemRole._id}`);
    console.log(`👤 Users Updated: ${updated}/${superAdmins.length}`);
    console.log("=".repeat(50) + "\n");

    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration Error:", error);
    process.exit(1);
  }
};

migrateSuperAdminGlobalTenant();
