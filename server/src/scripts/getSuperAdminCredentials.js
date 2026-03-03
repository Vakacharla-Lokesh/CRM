#!/usr/bin/env node

/**
 * getSuperAdminCredentials.js
 *
 * Quick utility to find and display super_admin user credentials for testing.
 *
 * Usage:
 *   node getSuperAdminCredentials.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  tenantId: mongoose.Schema.Types.ObjectId,
  role: String,
  roleId: mongoose.Schema.Types.ObjectId,
  isActive: Boolean,
});

const tenantSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const UserModel = mongoose.model("Users", userSchema);
const TenantModel = mongoose.model("Tenants", tenantSchema);

async function getSuperAdminCredentials() {
  try {
    if (!process.env.DB_URI) {
      throw new Error("❌ DB_URI not found in .env file");
    }

    console.log("\n" + "═".repeat(70));
    console.log("🔑 SUPER ADMIN CREDENTIALS FINDER");
    console.log("═".repeat(70) + "\n");

    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected\n");

    // Find all super_admin users
    console.log("🔍 Searching for super_admin users...\n");
    const superAdmins = await UserModel.find({ role: "super_admin" })
      .sort({ createdAt: -1 })
      .limit(10);

    if (superAdmins.length === 0) {
      console.log("❌ No super_admin user found in database");
      console.log("\n💡 Run the seeding script first:");
      console.log("   node seedAll.js --commit\n");
      process.exit(0);
    }

    if (superAdmins.length > 1) {
      console.warn(
        `⚠️  WARNING: Found ${superAdmins.length} super_admin users (should be only 1)`,
      );
      console.warn("   This might indicate a data integrity issue.\n");
    }

    console.log(`✅ Found ${superAdmins.length} super_admin user(s)\n`);
    console.log("═".repeat(70));
    console.log("🔐 GLOBAL SUPER ADMIN CREDENTIALS");
    console.log("═".repeat(70) + "\n");

    const admin = superAdmins[0]; // Get the first (and should be only) super_admin

    // Get tenant name for reference
    const tenant = await TenantModel.findById(admin.tenantId);
    const name = tenant?.name || "Unknown";

    console.log(`Name:        ${admin.firstName} ${admin.lastName}`);
    console.log(`────────────────────────────────────────────────────`);
    console.log(`Email:       ${admin.email}`);
    console.log(`Password:    TestPassword123!`);
    console.log(`Role:        ${admin.role.toUpperCase()}`);
    console.log(`Access:      🌍 GLOBAL (entire system)`);
    console.log(`Status:      ${admin.isActive ? "✅ Active" : "❌ Inactive"}`);
    console.log(`User ID:     ${admin._id}`);
    console.log(`Ref Tenant:  ${name}`);
    console.log("");

    console.log("═".repeat(70));
    console.log("📝 USAGE INSTRUCTIONS");
    console.log("═".repeat(70) + "\n");

    console.log("1. Go to login page: http://localhost:3000/login");
    console.log(`2. Email:    ${superAdmins[0].email}`);
    console.log("3. Password: TestPassword123!");
    console.log("4. Click Login");
    console.log("");
    console.log("🔓 This Super Admin has:");
    console.log("   ✓ Global system access");
    console.log("   ✓ All 44 permissions");
    console.log("   ✓ Can manage all tenants");
    console.log("   ✓ Can manage all roles and users");
    console.log("   ✓ Can view all data in the system");
    console.log("");
    console.log("⚠️  IMPORTANT:");
    console.log("   There is ONLY ONE super_admin in the entire system.");
    console.log("   Protect these credentials carefully!");
    console.log("");
    console.log("═".repeat(70) + "\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

getSuperAdminCredentials();
