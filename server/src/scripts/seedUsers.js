/**
 * seedUsers.js
 *
 * Seed script to generate random test users for each tenant with proper role assignments.
 *
 * Prerequisites:
 *   - Tenants must exist in database (run seedTenants.js first)
 *   - Roles must exist per tenant (run seedRoles.js or migrations)
 *
 * Usage:
 *   node seedUsers.js                      # Dry run (preview only)
 *   node seedUsers.js --clear              # Clear existing test users first
 *   node seedUsers.js --clear --commit     # Actually write to DB
 *
 * Features:
 *   - Generates 5-10 users per tenant
 *   - Random role assignment (user, admin, super_admin weights)
 *   - Valid email format
 *   - Valid mobile format (10 digits, starts with 1-9)
 *   - Pre-hashed passwords for testing
 *   - Respects RBAC v2 (roleId required)
 */

import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, alias: "userId", auto: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: {
      type: String,
      unique: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email address",
      ],
    },
    mobile: {
      type: String,
      match: [/^[1-9]\d{9}$/, "Please provide valid mobile number"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "super_admin"],
      required: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      index: true,
      validate: {
        validator: function () {
          return this.role === "super_admin" || !!this.roleId;
        },
        message: "roleId is required for non-super_admin users",
      },
    },
    password: { type: String, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ tenantId: 1 });
userSchema.index({ tenantId: 1, roleId: 1 });
userSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
});

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    permissions: { type: [String], required: true },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    isActive: { type: Boolean, default: true },
    isSystemRole: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const UserModel = mongoose.model("Users", userSchema);
const RoleModel = mongoose.model("Roles", roleSchema);
const TenantModel = mongoose.model("Tenants", tenantSchema);

// ─────────────────────────────────────────────────────────────
// Random Data Generators
// ─────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Amit",
  "Priya",
  "Rajesh",
  "Ananya",
  "Vikas",
  "Neha",
  "Arjun",
  "Divya",
  "Rohan",
  "Aisha",
  "Karan",
  "Nisha",
  "Deepak",
  "Pooja",
  "Sanjay",
  "Shreya",
  "Nikhil",
  "Rina",
  "Varun",
  "Anjali",
  "John",
  "Sarah",
  "Michael",
  "Emma",
  "David",
  "Olivia",
  "Robert",
  "Sophia",
  "James",
  "Isabella",
];

const LAST_NAMES = [
  "Sharma",
  "Patel",
  "Singh",
  "Kumar",
  "Verma",
  "Desai",
  "Gupta",
  "Reddy",
  "Joshi",
  "Iyer",
  "Nair",
  "Bhat",
  "Rao",
  "Das",
  "Mishra",
  "Chopra",
  "Kapoor",
  "Malhotra",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
  "Thomas",
];

// NOTE: Super admin is NOT randomly assigned anymore
// Only ONE super_admin per tenant (the first user created)
// Regular users and admins are randomly assigned

const ACTIVITY_STATUSES = [true, true, true, false]; // 75% active

/**
 * Generate random first name
 */
function getRandomFirstName() {
  return FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
}

/**
 * Generate random last name
 */
function getRandomLastName() {
  return LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
}

/**
 * Generate random valid email
 */
function generateEmail(firstName, lastName, index) {
  const domain = `company${index}.com`;
  const localPart = `${firstName.toLowerCase()}.${lastName.toLowerCase()}-${Math.random().toString(36).substring(2, 5)}`;
  return `${localPart}@${domain}`;
}

/**
 * Generate random valid 10-digit mobile number
 */
function generateMobile() {
  const firstDigit = Math.floor(Math.random() * 9) + 1;
  const remainingDigits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
  return `${firstDigit}${remainingDigits}`;
}

/**
 * Assign role (user or admin only - NO super_admin)
 * Super admin is assigned explicitly as the first user of each tenant
 */
function assignRole() {
  const rand = Math.random();
  // 67% user, 33% admin (super_admin is handled separately as first user)
  return rand < 0.67 ? "user" : "admin";
}

/**
 * Generate a random password (in real system, would be sent via email)
 */
async function hashPassword(plainPassword) {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(plainPassword, salt);
}

/**
 * Generate users for a single tenant
 * All users are random user/admin mix (NO super_admin)
 * Super admin is created separately as a global user
 */
async function generateUsersForTenant(tenantId, tenantIndex, roleMap) {
  const userCount = Math.floor(Math.random() * 6) + 5; // 5-10 users per tenant
  const users = [];

  for (let i = 0; i < userCount; i++) {
    const firstName = getRandomFirstName();
    const lastName = getRandomLastName();

    // All users are random user/admin mix (no super_admin)
    const role = assignRole();

    // Get roleId from map
    let roleId = null;
    if (roleMap[tenantId.toString()]) {
      const tenantRoles = roleMap[tenantId.toString()];
      roleId = tenantRoles[role];
    }

    users.push({
      tenantId,
      firstName,
      lastName,
      email: generateEmail(firstName, lastName, tenantIndex),
      mobile: generateMobile(),
      role,
      roleId,
      password: await hashPassword("TestPassword123!"), // Standard test password
      isActive:
        ACTIVITY_STATUSES[Math.floor(Math.random() * ACTIVITY_STATUSES.length)],
    });
  }

  return users;
}

// ─────────────────────────────────────────────────────────────
// Main Seeding Logic
// ─────────────────────────────────────────────────────────────

async function seedUsers() {
  try {
    const args = process.argv.slice(2);
    const shouldClear = args.includes("--clear");
    const shouldCommit = args.includes("--commit");
    const dryRun = !shouldCommit;

    console.log("\n" + "=".repeat(70));
    console.log("🌱 USER DATA SEEDER (with Dynamic RBAC)");
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

    // Build a map of roleId by tenant and role name
    console.log("📋 Fetching roles for each tenant...");
    const roleMap = {};
    for (const tenant of tenants) {
      const tenantRoles = await RoleModel.find({ tenantId: tenant._id });
      roleMap[tenant._id.toString()] = {};
      for (const role of tenantRoles) {
        roleMap[tenant._id.toString()][role.name] = role._id;
      }
    }
    console.log(`✅ Loaded role mappings\n`);

    // Optional: Clear existing users
    if (shouldClear && shouldCommit) {
      console.log("🗑️  Clearing existing test users...");
      const result = await UserModel.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} existing users\n`);
    }

    // Generate users for each tenant
    console.log("🎲 Generating users for each tenant...");
    let allUsers = [];
    let totalUsersCount = 0;

    for (let i = 0; i < tenants.length; i++) {
      const tenant = tenants[i];
      const tenantUsers = await generateUsersForTenant(tenant._id, i, roleMap);
      allUsers = allUsers.concat(tenantUsers);
      totalUsersCount += tenantUsers.length;
    }

    console.log(
      `✅ Generated ${totalUsersCount} users across ${tenants.length} tenants\n`,
    );

    // Create ONE global super_admin user
    console.log("🔐 Creating global super_admin user...");
    const superAdminUser = {
      tenantId: tenants[0]._id, // Associate with first tenant for reference
      firstName: "System",
      lastName: "Administrator",
      email: "admin@crmsystem.com",
      mobile: "9999999999",
      role: "super_admin",
      roleId: null, // Super admin doesn't need roleId
      password: await hashPassword("TestPassword123!"),
      isActive: true,
    };
    allUsers.push(superAdminUser);
    console.log(`✅ Created global super_admin user\n`);

    // Display sample data
    console.log("📊 SAMPLE DATA (first 4 users including super_admin):");
    console.log("─".repeat(70));
    allUsers.slice(0, 4).forEach((user, idx) => {
      const isSuperAdmin = user.role === "super_admin";
      console.log(
        `\n#${idx + 1}${isSuperAdmin ? " 🔐 GLOBAL SUPER ADMIN" : ""}`,
      );
      console.log(`  Name:    ${user.firstName} ${user.lastName}`);
      console.log(`  Email:   ${user.email}`);
      console.log(`  Mobile:  ${user.mobile}`);
      console.log(
        `  Role:    ${user.role}${isSuperAdmin ? " (System-wide access)" : ""}`,
      );
      console.log(
        `  RoleId:  ${user.roleId ? user.roleId.toString().substring(0, 12) + "..." : "N/A"}`,
      );
      console.log(`  Active:  ${user.isActive ? "✅ Yes" : "❌ No"}`);
    });
    console.log("\n" + "─".repeat(70) + "\n");

    // Statistics
    const userCount = allUsers.filter((u) => u.role === "user").length;
    const adminCount = allUsers.filter((u) => u.role === "admin").length;
    const superAdminCount = allUsers.filter(
      (u) => u.role === "super_admin",
    ).length;
    const activeCount = allUsers.filter((u) => u.isActive).length;

    console.log("📈 STATISTICS:");
    console.log(`  Total Users:       ${allUsers.length}`);
    console.log(
      `  Regular Users:     ${userCount} (${((userCount / allUsers.length) * 100).toFixed(1)}%)`,
    );
    console.log(
      `  Admins:            ${adminCount} (${((adminCount / allUsers.length) * 100).toFixed(1)}%)`,
    );
    console.log(
      `  Super Admins:      ${superAdminCount} (${((superAdminCount / allUsers.length) * 100).toFixed(1)}%) ← GLOBAL`,
    );
    console.log(
      `  Active Users:      ${activeCount} (${((activeCount / allUsers.length) * 100).toFixed(1)}%)`,
    );
    console.log(
      `  Users per Tenant:  ${((allUsers.length - 1) / tenants.length).toFixed(1)} avg (excluding global super_admin)`,
    );
    console.log("");

    // Confirm before commit
    if (!dryRun) {
      console.log("⚠️  ABOUT TO WRITE TO DATABASE");
      console.log(
        `💾 This will insert ${allUsers.length} user documents into your MongoDB database.`,
      );
      console.log("");
    }

    // Insert data
    if (dryRun) {
      console.log("✨ DRY RUN COMPLETE - No changes made to database.");
      console.log("🚀 To commit these changes, run:");
      console.log(
        `   node seedUsers.js ${shouldClear ? "--clear " : ""}--commit`,
      );
    } else {
      console.log("💾 Inserting users into database...");
      try {
        const result = await UserModel.insertMany(allUsers, { ordered: false });
        console.log(`✅ Successfully inserted ${result.length} users\n`);
      } catch (error) {
        if (error.code === 11000) {
          console.error(
            "⚠️  Some users were not inserted due to duplicate emails.",
          );
          console.error(
            `✅ Inserted ${error.result.insertedIds?.length || 0} users before error.`,
          );
        } else {
          throw error;
        }
      }

      // Verify
      const count = await UserModel.countDocuments({});
      console.log(`📊 Total users in DB: ${count}`);
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
seedUsers();
