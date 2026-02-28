#!/usr/bin/env node

/**
 * seedUtils.js
 *
 * Utility script for common seeding operations:
 *   - Check if collections exist and have data
 *   - Get statistics about seeded data
 *   - Clear specific collections
 *   - Verify RBAC integrity
 *
 * Usage:
 *   node seedUtils.js --status          # Show database statistics
 *   node seedUtils.js --clear-all       # Delete all seeded data
 *   node seedUtils.js --verify          # Verify RBAC integrity
 *   node seedUtils.js --reset           # Full reset (clear + reseed)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

const tenantSchema = new mongoose.Schema({
  tenantName: String,
  email: String,
  mobile: String,
  isActive: Boolean,
});

const roleSchema = new mongoose.Schema({
  name: String,
  tenantId: mongoose.Schema.Types.ObjectId,
  isActive: Boolean,
  isSystemRole: Boolean,
  permissions: [String],
});

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  userEmail: String,
  tenantId: mongoose.Schema.Types.ObjectId,
  role: String,
  roleId: mongoose.Schema.Types.ObjectId,
  isActive: Boolean,
});

const TenantModel = mongoose.model("Tenants", tenantSchema);
const RoleModel = mongoose.model("Roles", roleSchema);
const UserModel = mongoose.model("Users", userSchema);

// ─────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────

/**
 * Show database statistics
 */
async function showStatus() {
  try {
    await mongoose.connect(process.env.DB_URI);

    console.log("\n" + "═".repeat(70));
    console.log("📊 DATABASE STATUS");
    console.log("═".repeat(70) + "\n");

    // Tenants
    const tenantCount = await TenantModel.countDocuments();
    const activeTenants = await TenantModel.countDocuments({ isActive: true });
    const inactiveTenants = await TenantModel.countDocuments({
      isActive: false,
    });

    console.log("🏢 TENANTS");
    console.log(`  Total:       ${tenantCount}`);
    console.log(
      `  Active:      ${activeTenants} (${tenantCount > 0 ? ((activeTenants / tenantCount) * 100).toFixed(1) : 0}%)`,
    );
    console.log(
      `  Inactive:    ${inactiveTenants} (${tenantCount > 0 ? ((inactiveTenants / tenantCount) * 100).toFixed(1) : 0}%)`,
    );

    // Roles
    const roleCount = await RoleModel.countDocuments();
    const systemRoles = await RoleModel.countDocuments({ isSystemRole: true });
    const customRoles = await RoleModel.countDocuments({ isSystemRole: false });
    const rolesPerTenant =
      tenantCount > 0 ? (roleCount / tenantCount).toFixed(1) : 0;

    console.log("\n👥 ROLES");
    console.log(`  Total:       ${roleCount}`);
    console.log(`  System:      ${systemRoles}`);
    console.log(`  Custom:      ${customRoles}`);
    console.log(`  Per Tenant:  ${rolesPerTenant} avg`);

    // Users
    const userCount = await UserModel.countDocuments();
    const activeUsers = await UserModel.countDocuments({ isActive: true });
    const inactiveUsers = await UserModel.countDocuments({ isActive: false });

    const userRoles = await UserModel.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const usersPerTenant =
      tenantCount > 0 ? (userCount / tenantCount).toFixed(1) : 0;

    console.log("\n👤 USERS");
    console.log(`  Total:       ${userCount}`);
    console.log(
      `  Active:      ${activeUsers} (${userCount > 0 ? ((activeUsers / userCount) * 100).toFixed(1) : 0}%)`,
    );
    console.log(
      `  Inactive:    ${inactiveUsers} (${userCount > 0 ? ((inactiveUsers / userCount) * 100).toFixed(1) : 0}%)`,
    );
    console.log(`  Per Tenant:  ${usersPerTenant} avg`);

    if (userRoles.length > 0) {
      console.log("\n  By Role:");
      for (const roleData of userRoles) {
        const percentage = ((roleData.count / userCount) * 100).toFixed(1);
        console.log(
          `    ${roleData._id}:      ${roleData.count} (${percentage}%)`,
        );
      }
    }

    // RBAC Integrity
    const usersWithoutRoleId = await UserModel.countDocuments({
      role: { $ne: "super_admin" },
      roleId: null,
    });

    console.log("\n🔐 RBAC v2 INTEGRITY");
    if (usersWithoutRoleId === 0) {
      console.log("  ✅ All users have proper roleId assignment");
    } else {
      console.log(
        `  ⚠️  ${usersWithoutRoleId} users missing roleId (non-super_admin)`,
      );
    }

    console.log("\n" + "═".repeat(70) + "\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

/**
 * Verify RBAC integrity
 */
async function verifyRBAC() {
  try {
    await mongoose.connect(process.env.DB_URI);

    console.log("\n" + "═".repeat(70));
    console.log("🔐 RBAC INTEGRITY VERIFICATION");
    console.log("═".repeat(70) + "\n");

    let issues = [];

    // Check 1: Users without roleId (non-super_admin)
    const usersWithoutRoleId = await UserModel.find({
      role: { $ne: "super_admin" },
      roleId: null,
    });

    if (usersWithoutRoleId.length > 0) {
      issues.push({
        level: "ERROR",
        count: usersWithoutRoleId.length,
        message: "Users missing roleId assignment",
        details: usersWithoutRoleId
          .slice(0, 3)
          .map((u) => `${u.userEmail} (role: ${u.role})`),
      });
    }

    // Check 2: Invalid roleId references
    const usersWithInvalidRoleId = await UserModel.aggregate([
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleData",
        },
      },
      { $match: { roleData: { $size: 0 }, roleId: { $ne: null } } },
    ]);

    if (usersWithInvalidRoleId.length > 0) {
      issues.push({
        level: "ERROR",
        count: usersWithInvalidRoleId.length,
        message: "Users with invalid roleId (role not found)",
        details: usersWithInvalidRoleId
          .slice(0, 3)
          .map((u) => `${u.userEmail}`),
      });
    }

    // Check 3: Roles without tenantId
    const rolesWithoutTenant = await RoleModel.find({ tenantId: null });

    if (rolesWithoutTenant.length > 0) {
      issues.push({
        level: "WARNING",
        count: rolesWithoutTenant.length,
        message: "Roles missing tenantId",
        details: rolesWithoutTenant.slice(0, 3).map((r) => r.name),
      });
    }

    // Check 4: Users not belonging to valid tenants
    const tenantsSet = new Set();
    const allTenants = await TenantModel.find();
    allTenants.forEach((t) => tenantsSet.add(t._id.toString()));

    const usersInvalidTenant = await UserModel.find();
    const invalidTenantUsers = usersInvalidTenant.filter(
      (u) => !tenantsSet.has(u.tenantId.toString()),
    );

    if (invalidTenantUsers.length > 0) {
      issues.push({
        level: "ERROR",
        count: invalidTenantUsers.length,
        message: "Users assigned to non-existent tenants",
        details: invalidTenantUsers.slice(0, 3).map((u) => u.userEmail),
      });
    }

    // Report
    if (issues.length === 0) {
      console.log("✅ All RBAC integrity checks passed!");
      console.log("");
    } else {
      for (const issue of issues) {
        const icon =
          issue.level === "ERROR"
            ? "❌"
            : issue.level === "WARNING"
              ? "⚠️"
              : "ℹ️";
        console.log(`${icon} ${issue.message}`);
        console.log(`   Count: ${issue.count}`);
        if (issue.details.length > 0) {
          console.log(`   Examples: ${issue.details.join(", ")}`);
        }
        console.log("");
      }
    }

    console.log("═".repeat(70) + "\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

/**
 * Clear all test data
 */
async function clearAll() {
  try {
    await mongoose.connect(process.env.DB_URI);

    console.log("\n" + "═".repeat(70));
    console.log("🗑️  CLEARING ALL TEST DATA");
    console.log("═".repeat(70) + "\n");

    const results = {
      tenants: await TenantModel.deleteMany({}),
      roles: await RoleModel.deleteMany({}),
      users: await UserModel.deleteMany({}),
    };

    console.log("✅ Deleted:");
    console.log(`  Tenants: ${results.tenants.deletedCount}`);
    console.log(`  Roles:   ${results.roles.deletedCount}`);
    console.log(`  Users:   ${results.users.deletedCount}`);
    console.log("");
    console.log("═".repeat(70) + "\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

/**
 * Full reset: clear + reseed
 */
async function fullReset() {
  console.log("\n" + "═".repeat(70));
  console.log("🔄 FULL RESET: Clearing + Reseeding");
  console.log("═".repeat(70) + "\n");

  // First clear
  await clearAll();

  // Then reseed
  console.log("🌱 Starting reseed...\n");

  const scripts = ["seedTenants.js", "seedRoles.js", "seedUsers.js"];

  for (const script of scripts) {
    try {
      await runScript(script, ["--commit"]);
    } catch (error) {
      console.error(`❌ Failed to run ${script}`);
      process.exit(1);
    }
  }

  console.log("✅ Full reset complete!");
}

/**
 * Run a script via child_process
 */
function runScript(scriptFile, args) {
  return new Promise((resolve, reject) => {
    const process = spawn("node", [scriptFile, ...args], {
      stdio: "inherit",
      cwd: __dirname,
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${scriptFile} exited with code ${code}`));
      }
    });

    process.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Display help
 */
function showHelp() {
  console.log(`
🔧 Database Seeding Utilities

Usage:
  node seedUtils.js [COMMAND]

Commands:
  --status       Show database statistics and counts
  --verify       Verify RBAC integrity and data consistency
  --clear-all    Delete all test data (tenants, roles, users)
  --reset        Full reset: clear everything + reseed from scratch
  --help         Show this help message

Examples:
  node seedUtils.js --status      # Check current database state
  node seedUtils.js --verify      # Verify all data is consistent
  node seedUtils.js --clear-all   # Delete all test data
  node seedUtils.js --reset       # Start fresh with new test data

Environment:
  DB_URI must be set in server/.env file
  `);
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!process.env.DB_URI) {
    console.error("❌ DB_URI not found in .env file");
    process.exit(1);
  }

  switch (command) {
    case "--status":
      await showStatus();
      break;
    case "--verify":
      await verifyRBAC();
      break;
    case "--clear-all":
      await clearAll();
      break;
    case "--reset":
      await fullReset();
      break;
    case "--help":
    case "-h":
    case undefined:
      showHelp();
      break;
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log("");
      showHelp();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
