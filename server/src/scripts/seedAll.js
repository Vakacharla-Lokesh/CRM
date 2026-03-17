#!/usr/bin/env node

/**
 * seedAll.js
 *
 * Master orchestrator for seeding the entire database with test data.
 * This script ensures proper execution order and dependency satisfaction.
 *
 * Order:
 *   1. seedTenants.js     - Creates 50 test tenants
 *   2. seedRoles.js       - Creates default roles per tenant (3 per tenant = 150 roles)
 *   3. seedUsers.js       - Creates users per tenant with role assignments
 *
 * Usage:
 *   node seedAll.js                  # Dry run (preview all changes)
 *   node seedAll.js --clear          # Dry run with clear enabled
 *   node seedAll.js --commit         # Actually write to DB
 *   node seedAll.js --clear --commit # Clear + write (FULL RESET)
 *
 * Safety:
 *   - Always runs in dry-run mode first (preview what will happen)
 *   - Passes --clear and --commit flags to each script
 *   - Checks for errors and stops on failure
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCRIPTS = [
  {
    name: "Tenants",
    file: "seedTenants.js",
    description: "Generate 50 random test tenants",
    dependsOn: null,
  },
  {
    name: "Roles",
    file: "seedRoles.js",
    description: "Create default RBAC roles per tenant",
    dependsOn: "Tenants",
  },
  {
    name: "Users",
    file: "seedUsers.js",
    description: "Generate users with role assignments",
    dependsOn: "Roles",
  },
];

/**
 * Run a seed script with the given arguments
 */
function runScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const process = spawn("node", [scriptPath, ...args], {
      stdio: "inherit",
      cwd: __dirname,
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });

    process.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Main orchestration logic
 */
async function orchestrateSeed() {
  const args = process.argv.slice(2);
  const shouldClear = args.includes("--clear");
  const shouldCommit = args.includes("--commit");

  console.log("\n" + "═".repeat(80));
  console.log("🌱 DATABASE SEEDING ORCHESTRATOR");
  console.log("═".repeat(80));
  console.log("");

  // Display mode
  const mode = shouldCommit
    ? "🔴 COMMIT MODE (writing to DB)"
    : "📋 DRY RUN MODE (preview only)";

  console.log(`Mode:         ${mode}`);
  console.log(`Clear first:  ${shouldClear ? "✅ Yes" : "❌ No"}`);
  console.log(`Commit:       ${shouldCommit ? "✅ Yes" : "❌ No"}`);
  console.log("");

  // Display execution plan
  console.log("📋 EXECUTION PLAN:");
  console.log("─".repeat(80));
  SCRIPTS.forEach((script, idx) => {
    const depString = script.dependsOn
      ? ` (requires: ${script.dependsOn})`
      : " (no dependencies)";
    console.log(
      `${idx + 1}. ${script.name.padEnd(12)} - ${script.description}${depString}`,
    );
  });
  console.log("─".repeat(80));
  console.log("");

  // Confirmation
  if (shouldCommit) {
    console.log(
      "⚠️  " +
        chalk.yellow.bold("ATTENTION: You are about to modify your database!"),
    );
    console.log("");
  }

  const scriptArgs = [];
  if (shouldClear) scriptArgs.push("--clear");
  if (shouldCommit) scriptArgs.push("--commit");

  console.log(
    `Arguments passed to each script: ${scriptArgs.length > 0 ? scriptArgs.join(" ") : "(none - dry run)"}`,
  );
  console.log("");

  // Execute scripts in order
  let scriptIndex = 0;
  for (const script of SCRIPTS) {
    scriptIndex++;

    try {
      console.log("═".repeat(80));
      console.log(
        `[${scriptIndex}/${SCRIPTS.length}] Running: ${script.name} (${script.file})`,
      );
      console.log("═".repeat(80));
      console.log("");

      const scriptPath = path.join(__dirname, script.file);
      await runScript(scriptPath, scriptArgs);

      console.log("");
      console.log(`✅ ${script.name} completed successfully`);
      console.log("");
    } catch (error) {
      console.error("");
      console.error(`❌ ${script.name} failed: ${error.message}`);
      console.error("");
      console.error("🛑 Stopping orchestration (dependency chain broken)");
      console.error("");
      process.exit(1);
    }
  }

  // Success summary
  console.log("═".repeat(80));
  console.log("✅ ALL SEEDING COMPLETE");
  console.log("═".repeat(80));
  console.log("");

  console.log("📊 What was created:");
  console.log("  ✓ 50 test tenants");
  console.log("  ✓ 150 system roles (3 per tenant)");
  console.log("  ✓ ~250-500 test users (5-10 per tenant)");
  console.log("");

  if (!shouldCommit) {
    console.log(
      "💡 This was a DRY RUN. To actually write to the database, run:",
    );
    console.log("");
    console.log(`   node seedAll.js ${shouldClear ? "--clear " : ""}--commit`);
  } else {
    console.log("🎉 Test data successfully written to database!");
    console.log("");
    console.log("Next steps:");
    console.log("  1. Start your backend: npm run dev");
    console.log("  2. Start your frontend: npm start");
    console.log("  3. Login with any generated user email");
    console.log("  4. Test pagination, searching, and filtering");
  }

  console.log("");
  console.log("═".repeat(80));
  console.log("");
}

// Run orchestrator
orchestrateSeed().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
