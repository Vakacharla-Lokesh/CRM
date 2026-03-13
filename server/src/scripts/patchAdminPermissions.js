import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Role from "../modules/roles/models/roleModel.js";
import User from "../modules/users/models/userModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Patch Script: Add missing permissions to existing admin roles and users
 *
 * Adds: roles:read, roles:write, roles:delete, users:delete,
 *       users:manage_roles, bulk:delete, settings:write
 */

const MISSING_ADMIN_PERMISSIONS = [
  "roles:read",
  "roles:write",
  "roles:delete",
  "users:delete",
  "users:manage_roles",
  "bulk:delete",
  "settings:write",
];

const patchAdminPermissions = async () => {
  try {
    console.log("🚀 Starting admin permissions patch...\n");

    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected to MongoDB\n");

    // 1. Patch Role documents (permissions stored as String[])
    const roleResult = await Role.updateMany(
      { name: "admin" },
      { $addToSet: { permissions: { $each: MISSING_ADMIN_PERMISSIONS } } },
    );

    console.log(`✅ Patched ${roleResult.modifiedCount} admin role(s)`);
    console.log(`ℹ️  Matched: ${roleResult.matchedCount} admin role(s)`);

    // 2. Patch User documents (permissions stored as Map<string, Boolean>)
    // Build $set object: { "permissions.roles:read": true, ... }
    const permissionsSetPayload = MISSING_ADMIN_PERMISSIONS.reduce(
      (acc, permission) => {
        acc[`permissions.${permission}`] = true;
        return acc;
      },
      {},
    );

    const userResult = await User.updateMany(
      { role: "admin" },
      { $set: permissionsSetPayload },
    );

    console.log(`\n✅ Patched ${userResult.modifiedCount} admin user(s)`);
    console.log(`ℹ️  Matched: ${userResult.matchedCount} admin user(s)`);

    if (
      roleResult.modifiedCount === 0 &&
      roleResult.matchedCount > 0 &&
      userResult.modifiedCount === 0 &&
      userResult.matchedCount > 0
    ) {
      console.log("ℹ️  All admin roles and users already have the required permissions");
    }

    console.log("\nAdded permissions:");
    MISSING_ADMIN_PERMISSIONS.forEach((p) => console.log(`  + ${p}`));

    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Patch Error:", error);
    process.exit(1);
  }
};

patchAdminPermissions();
