/**
 * seedRoles.js
 *
 * Seed script to create default system roles for each tenant.
 *
 * This script creates 3 default roles per tenant:
 *   - user (regular user permissions)
 *   - admin (admin permissions)
 *   - super_admin (all permissions)
 *
 * Prerequisites:
 *   - Tenants must exist in database (run seedTenants.js first)
 *
 * Usage:
 *   node seedRoles.js                      # Dry run (preview only)
 *   node seedRoles.js --clear              # Clear existing test roles first
 *   node seedRoles.js --clear --commit     # Actually write to DB
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
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
      required: true,
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
  { timestamps: true },
);

roleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const tenantSchema = new mongoose.Schema(
  {
    tenantName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const RoleModel = mongoose.model("Roles", roleSchema);
const TenantModel = mongoose.model("Tenants", tenantSchema);

// ─────────────────────────────────────────────────────────────
// Permission Presets
// ─────────────────────────────────────────────────────────────

const PERMISSION_MAP = {
  LEADS: [
    "leads:read",
    "leads:write",
    "leads:delete",
    "leads:export",
    "leads:assign",
    "leads:view_all",
  ],
  DEALS: [
    "deals:read",
    "deals:write",
    "deals:delete",
    "deals:export",
    "deals:view_all",
  ],
  USERS: [
    "users:read",
    "users:write",
    "users:delete",
    "users:manage_roles",
    "users:view_all",
  ],
  ORGANIZATIONS: [
    "organizations:read",
    "organizations:write",
    "organizations:delete",
    "organizations:export",
    "organizations:view_all",
  ],
  ROLES: ["roles:read", "roles:write", "roles:delete"],
  TENANTS: ["tenants:read", "tenants:write", "tenants:delete"],
  ANALYTICS: ["analytics:read", "analytics:export", "analytics:view_all"],
  CALLS: ["calls:read", "calls:write", "calls:delete"],
  COMMENTS: ["comments:read", "comments:write", "comments:delete"],
  ATTACHMENTS: ["attachments:read", "attachments:write", "attachments:delete"],
  BULK: ["bulk:import", "bulk:export", "bulk:delete"],
  SETTINGS: ["settings:read", "settings:write"],
};

const ALL_PERMISSIONS = Object.values(PERMISSION_MAP).flat();

const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: ALL_PERMISSIONS,

  admin: [
    ...PERMISSION_MAP.LEADS,
    ...PERMISSION_MAP.DEALS,
    ...PERMISSION_MAP.ORGANIZATIONS,
    ...PERMISSION_MAP.CALLS,
    ...PERMISSION_MAP.COMMENTS,
    ...PERMISSION_MAP.ATTACHMENTS,
    "users:read",
    "users:write",
    "users:view_all",
    "analytics:read",
    "analytics:export",
    "analytics:view_all",
    "bulk:import",
    "bulk:export",
    "settings:read",
  ],

  user: [
    "leads:read",
    "leads:write",
    "deals:read",
    "deals:write",
    "organizations:read",
    "calls:read",
    "calls:write",
    "comments:read",
    "comments:write",
    "attachments:read",
    "attachments:write",
    "analytics:read",
  ],
};

// ─────────────────────────────────────────────────────────────
// Main Seeding Logic
// ─────────────────────────────────────────────────────────────

async function seedRoles() {
  try {
    const args = process.argv.slice(2);
    const shouldClear = args.includes("--clear");
    const shouldCommit = args.includes("--commit");
    const dryRun = !shouldCommit;

    console.log("\n" + "=".repeat(70));
    console.log("🌱 ROLE DATA SEEDER (Dynamic RBAC)");
    console.log("=".repeat(70));
    console.log(
      `📋 Mode: ${dryRun ? "DRY RUN (preview only)" : "🔴 COMMIT (writing to DB)"}`,
    );
    console.log(`🗑️  Clear mode: ${shouldClear ? "YES" : "NO"}`);
    console.log("");

    // Connect to MongoDB
    if (!process.env.DB_URI) {
      throw new Error("❌ DB_URI not found in .env file");
    }

    console.log(`📡 Connecting to: ${process.env.DB_URI.substring(0, 50)}...`);
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Fetch all tenants
    console.log("📊 Fetching tenants from database...");
    const tenants = await TenantModel.find({ isActive: true });
    if (tenants.length === 0) {
      throw new Error(
        "❌ No active tenants found. Please run seedTenants.js first.",
      );
    }
    console.log(`✅ Found ${tenants.length} active tenants\n`);

    // Optional: Clear existing roles
    if (shouldClear && shouldCommit) {
      console.log("🗑️  Clearing existing test roles...");
      const result = await RoleModel.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} existing roles\n`);
    }

    // Generate roles for each tenant
    console.log("🎲 Generating default roles for each tenant...");
    let allRoles = [];
    let rolesPerTenant = 0;

    for (const tenant of tenants) {
      for (const [roleName, permissions] of Object.entries(
        DEFAULT_ROLE_PERMISSIONS,
      )) {
        allRoles.push({
          name: roleName,
          description: `Default ${roleName.replace("_", " ")} role for ${tenant.tenantName}`,
          permissions,
          tenantId: tenant._id,
          isSystemRole: true,
          isActive: true,
        });
      }
      rolesPerTenant = 3; // user, admin, super_admin
    }

    const totalRoles = allRoles.length;
    console.log(
      `✅ Generated ${totalRoles} roles (${rolesPerTenant} per tenant)\n`,
    );

    // Display sample data
    console.log("📊 SAMPLE DATA (first tenant's roles):");
    console.log("─".repeat(70));
    const firstTenantRoles = allRoles.slice(0, 3);
    firstTenantRoles.forEach((role, idx) => {
      console.log(`\n#${idx + 1} - ${role.name}`);
      console.log(`  Description: ${role.description}`);
      console.log(`  Permissions: ${role.permissions.length} total`);
      console.log(`  Sample:      ${role.permissions.slice(0, 3).join(", ")}`);
      console.log(`  System Role: ${role.isSystemRole ? "✅ Yes" : "❌ No"}`);
    });
    console.log("\n" + "─".repeat(70) + "\n");

    // Statistics
    const superAdminRoles = allRoles.filter((r) => r.name === "super_admin");
    const adminRoles = allRoles.filter((r) => r.name === "admin");
    const userRoles = allRoles.filter((r) => r.name === "user");
    const avgPermsPerRole = (
      allRoles.reduce((sum, r) => sum + r.permissions.length, 0) / totalRoles
    ).toFixed(1);

    console.log("📈 STATISTICS:");
    console.log(`  Total Roles:         ${totalRoles}`);
    console.log(`  Super Admin Roles:   ${superAdminRoles.length}`);
    console.log(`  Admin Roles:         ${adminRoles.length}`);
    console.log(`  User Roles:          ${userRoles.length}`);
    console.log(`  Avg Perms/Role:      ${avgPermsPerRole}`);
    console.log(
      `  Total Permissions:   ${Object.keys(PERMISSION_MAP).length} categories`,
    );
    console.log(`  Unique Permissions:  ${ALL_PERMISSIONS.length}`);
    console.log("");

    // Confirm before commit
    if (!dryRun) {
      console.log("⚠️  ABOUT TO WRITE TO DATABASE");
      console.log(
        `💾 This will insert ${totalRoles} role documents into your MongoDB database.`,
      );
      console.log("");
    }

    // Insert data
    if (dryRun) {
      console.log("✨ DRY RUN COMPLETE - No changes made to database.");
      console.log("🚀 To commit these changes, run:");
      console.log(
        `   node seedRoles.js ${shouldClear ? "--clear " : ""}--commit`,
      );
    } else {
      console.log("💾 Inserting roles into database...");
      try {
        const result = await RoleModel.insertMany(allRoles, { ordered: false });
        console.log(`✅ Successfully inserted ${result.length} roles\n`);
      } catch (error) {
        if (error.code === 11000) {
          console.error(
            "⚠️  Some roles were not inserted (likely duplicates).",
          );
          console.error(
            `✅ Inserted ${error.result.insertedIds?.length || 0} roles before error.`,
          );
        } else {
          throw error;
        }
      }

      // Verify
      const count = await RoleModel.countDocuments({});
      console.log(`📊 Total roles in DB: ${count}`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ SEEDING COMPLETE");
    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    if (error.message.includes("No active tenants")) {
      console.error("\n💡 Make sure to seed tenants first:");
      console.error("   node seedTenants.js --commit");
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB\n");
  }
}

// Run if executed directly
seedRoles();
