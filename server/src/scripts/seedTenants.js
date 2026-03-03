/**
 * seedTenants.js
 *
 * Seed script to generate 50 random test tenants for development/testing.
 *
 * Usage:
 *   node seedTenants.js                    # Dry run (preview only)
 *   node seedTenants.js --clear            # Clear existing test tenants first
 *   node seedTenants.js --clear --commit   # Actually write to DB
 *
 * Environment:
 *   DB_URI=mongodb://... (from .env)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

// ─────────────────────────────────────────────────────────────
// Tenant Model (minimal, imported from your repo)
// ─────────────────────────────────────────────────────────────

const tenantSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      alias: "tenantId",
      auto: true,
    },
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email address",
      ],
    },
    mobile: {
      type: String,
      required: true,
      match: [/^[1-9]\d{9}$/, "Please provide valid mobile number"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

tenantSchema.index({
  name: "text",
  email: "text",
});

const TenantModel = mongoose.model("Tenants", tenantSchema);

// ─────────────────────────────────────────────────────────────
// Random Data Generators
// ─────────────────────────────────────────────────────────────

const COMPANY_ADJECTIVES = [
  "Global",
  "Prime",
  "Elite",
  "Apex",
  "Titan",
  "Nova",
  "Zenith",
  "Quantum",
  "Dynamic",
  "Swift",
  "Pure",
  "Smart",
  "Bright",
  "Bold",
  "Next",
  "Mega",
  "Ultra",
  "Sync",
  "Flow",
  "Peak",
];

const COMPANY_NOUNS = [
  "Solutions",
  "Systems",
  "Labs",
  "Corp",
  "Tech",
  "Digital",
  "Cloud",
  "Data",
  "AI",
  "Analytics",
  "Ventures",
  "Partners",
  "Group",
  "Innovations",
  "Services",
  "Industries",
  "Networks",
  "Platforms",
  "Hub",
  "Studio",
];

const EMAIL_DOMAINS = [
  "company.com",
  "corporate.net",
  "business.io",
  "enterprise.co",
  "solutions.com",
  "tech.io",
  "digital.net",
  "cloud.io",
  "data.com",
  "analytics.io",
  "ventures.com",
  "group.net",
  "innovations.io",
  "services.com",
  "industries.net",
];

const ACTIVITY_STATUSES = [true, true, true, false]; // 75% active, 25% inactive (realistic)

/**
 * Generate random company name
 */
function generateCompanyName() {
  const adj =
    COMPANY_ADJECTIVES[Math.floor(Math.random() * COMPANY_ADJECTIVES.length)];
  const noun = COMPANY_NOUNS[Math.floor(Math.random() * COMPANY_NOUNS.length)];
  return `${adj} ${noun}`;
}

/**
 * Generate random valid email
 */
function generateEmail(index) {
  const domain =
    EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
  // Use index to ensure uniqueness
  const localPart = `tenant${index}-${Math.random().toString(36).substring(2, 8)}`;
  return `${localPart}@${domain}`;
}

/**
 * Generate random valid 10-digit mobile number (Indian format: 1-9 followed by 9 digits)
 */
function generateMobile() {
  const firstDigit = Math.floor(Math.random() * 9) + 1; // 1-9
  const remainingDigits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
  return `${firstDigit}${remainingDigits}`;
}

/**
 * Generate random active status (75% active)
 */
function generateActiveStatus() {
  return ACTIVITY_STATUSES[
    Math.floor(Math.random() * ACTIVITY_STATUSES.length)
  ];
}

/**
 * Generate a single random tenant
 */
function generateTenant(index) {
  return {
    name: generateCompanyName(),
    email: generateEmail(index),
    mobile: generateMobile(),
    isActive: generateActiveStatus(),
  };
}

/**
 * Generate 50 random tenants
 */
function generateTenants(count = 50) {
  const tenants = [];
  for (let i = 0; i < count; i++) {
    tenants.push(generateTenant(i));
  }
  return tenants;
}

// ─────────────────────────────────────────────────────────────
// Main Seeding Logic
// ─────────────────────────────────────────────────────────────

async function seedTenants() {
  try {
    const args = process.argv.slice(2);
    const shouldClear = args.includes("--clear");
    const shouldCommit = args.includes("--commit");
    const dryRun = !shouldCommit;

    console.log("\n" + "=".repeat(70));
    console.log("🌱 TENANT DATA SEEDER");
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

    // Optional: Clear existing tenants
    if (shouldClear && shouldCommit) {
      console.log("🗑️  Clearing existing test tenants...");
      const result = await TenantModel.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} existing tenants\n`);
    }

    // Generate random tenants
    console.log("🎲 Generating 50 random tenants...");
    const tenants = generateTenants(50);
    console.log(`✅ Generated ${tenants.length} tenants\n`);

    // Display sample data
    console.log("📊 SAMPLE DATA (first 3):");
    console.log("─".repeat(70));
    tenants.slice(0, 3).forEach((tenant, idx) => {
      console.log(`\n#${idx + 1}`);
      console.log(`  Tenant Name: ${tenant.name}`);
      console.log(`  Email:       ${tenant.email}`);
      console.log(`  Mobile:      ${tenant.mobile}`);
      console.log(`  Active:      ${tenant.isActive ? "✅ Yes" : "❌ No"}`);
    });
    console.log("\n" + "─".repeat(70) + "\n");

    // Statistics
    const activeCount = tenants.filter((t) => t.isActive).length;
    const inactiveCount = tenants.filter((t) => !t.isActive).length;

    console.log("📈 STATISTICS:");
    console.log(`  Total:    ${tenants.length}`);
    console.log(
      `  Active:   ${activeCount} (${((activeCount / tenants.length) * 100).toFixed(1)}%)`,
    );
    console.log(
      `  Inactive: ${inactiveCount} (${((inactiveCount / tenants.length) * 100).toFixed(1)}%)`,
    );
    console.log("");

    // Confirm before commit
    if (!dryRun) {
      console.log("⚠️  ABOUT TO WRITE TO DATABASE");
      console.log(
        "💾 This will insert 50 tenant documents into your MongoDB database.",
      );
      console.log("");
    }

    // Insert data
    if (dryRun) {
      console.log("✨ DRY RUN COMPLETE - No changes made to database.");
      console.log("🚀 To commit these changes, run:");
      console.log(
        `   node seedTenants.js ${shouldClear ? "--clear " : ""}--commit`,
      );
    } else {
      console.log("💾 Inserting tenants into database...");
      const result = await TenantModel.insertMany(tenants, { ordered: false });
      console.log(`✅ Successfully inserted ${result.length} tenants\n`);

      // Verify
      const count = await TenantModel.countDocuments({});
      console.log(`📊 Total tenants in DB: ${count}`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ SEEDING COMPLETE");
    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    if (error.code === 11000) {
      console.error(
        "\n💡 Duplicate key error detected. This is likely because these tenants",
      );
      console.error(
        "   already exist in the database. Try running with --clear flag:",
      );
      console.error("   node seedTenants.js --clear --commit");
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB\n");
  }
}

// Run if executed directly
seedTenants();
