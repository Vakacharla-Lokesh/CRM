import mongoose from "mongoose";
import dotenv from "dotenv";
import chalk from "chalk";
import { seedOrganizations } from "./seedOrganizations.js";
import { seedLeads } from "./seedLeads.js";
import { seedDeals } from "./seedDeals.js";
import { seedWorkflows } from "./seedWorkflows.js";

import tenantModel from "../../src/modules/tenants/models/tenantModel.js";
import userModel from "../../src/modules/users/models/userModel.js";

dotenv.config({ path: "../../.env" });

const MONGODB_URI = process.env.DB_URI || "mongodb://localhost:27017/crm";

async function seed() {
  try {
    console.log(chalk.blue.bold("\n🌱 Starting database seed...\n"));

    // Connect to MongoDB
    console.log(chalk.dim("Connecting to MongoDB..."));
    await mongoose.connect(MONGODB_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(chalk.green("✓ Connected\n"));

    // ✅ FIX: Await the database queries
    console.log(chalk.cyan("1️⃣  Fetching tenants..."));
    const tenants = await tenantModel.find({});
    console.log(chalk.green(`✓ Found ${tenants.length} tenants\n`));

    console.log(chalk.cyan("2️⃣  Fetching roles..."));
    const roles = await roleModel.find({});
    console.log(chalk.green(`✓ Found ${roles.length} roles\n`));

    console.log(chalk.cyan("3️⃣  Fetching users..."));
    const users = await userModel.find({});
    console.log(chalk.green(`✓ Found ${users.length} users\n`));

    console.log(chalk.cyan("4️⃣  Seeding organizations..."));
    const organizations = await seedOrganizations(tenants, users);
    console.log(
      chalk.green(`✓ Created ${organizations.length} organizations\n`),
    );

    console.log(chalk.cyan("5️⃣  Seeding leads..."));
    const leads = await seedLeads(tenants, users, organizations);
    console.log(chalk.green(`✓ Created ${leads.length} leads\n`));

    console.log(chalk.cyan("6️⃣  Seeding deals..."));
    const deals = await seedDeals(tenants, users, leads, organizations);
    console.log(chalk.green(`✓ Created ${deals.length} deals\n`));

    console.log(chalk.cyan("7️⃣  Seeding workflows..."));
    const workflows = await seedWorkflows(tenants, users);
    console.log(chalk.green(`✓ Created ${workflows.length} workflows\n`));

    // Summary
    console.log(chalk.bold.green("\n✨ Seed completed successfully!\n"));
    console.log(chalk.dim("Summary:"));
    console.log(`  Tenants:       ${tenants.length}`);
    console.log(`  Roles:         ${roles.length}`);
    console.log(`  Users:         ${users.length}`);
    console.log(`  Organizations: ${organizations.length}`);
    console.log(`  Leads:         ${leads.length}`);
    console.log(`  Deals:         ${deals.length}`);
    console.log(`  Workflows:     ${workflows.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error(chalk.red.bold("\n❌ Seeding failed:\n"));
    console.error(chalk.red(error.message));
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

/**
 * Optional: Clean database before seeding
 */
async function cleanDatabase() {
  const collections = [
    "Tenants",
    "Users",
    "Roles",
    "Organizations",
    "Leads",
    "Deals",
    "Workflows",
  ];

  for (const collection of collections) {
    try {
      await mongoose.connection.collection(collection).deleteMany({});
    } catch (e) {
      // Collection may not exist
    }
  }
}

seed();
