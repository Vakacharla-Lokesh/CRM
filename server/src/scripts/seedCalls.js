#!/usr/bin/env node

/**
 * seedCalls.js
 *
 * Seeds Calls collection using leads already present in the DB.
 * Does NOT re-seed leads — reads existing leads directly.
 *
 * Usage:
 *   node seedCalls.js           # Dry run (preview count)
 *   node seedCalls.js --commit  # Write to DB
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

import Call from "../modules/calls/models/callModel.js";
import Lead from "../modules/leads/models/leadModel.js";

const callTypes = ["incoming", "outgoing"];
const callStatuses = ["completed", "missed", "no-answer", "voicemail"];

const callNotes = [
  "Discussed pricing options and next steps.",
  "Lead was unavailable. Will retry tomorrow.",
  "Brief call — lead requested a follow-up email with details.",
  "Confirmed demo appointment for next week.",
  "Lead raised concerns about onboarding timeline.",
  "Positive conversation. Lead is moving forward internally.",
  "Left a voicemail with contact info and a brief intro.",
  "Talked through integration requirements in detail.",
  "Lead mentioned budget constraints. Offered flexible plans.",
  "Decision maker was in a meeting. Scheduled callback.",
  "Addressed objections around pricing. Lead seemed satisfied.",
  "Quick check-in call. Lead still reviewing the proposal.",
  "Call disconnected early. Sent follow-up email instead.",
  "Lead confirmed they are evaluating three vendors including us.",
  null,
  null,
  null,
];

async function seedCalls() {
  const shouldCommit = process.argv.includes("--commit");

  await mongoose.connect(process.env.DB_URI);

  const leads = await Lead.find({}, { _id: 1 }).lean();

  if (leads.length === 0) {
    console.log("❌ No leads found in DB. Run seedLeads first.");
    process.exit(1);
  }

  const docs = [];

  for (const lead of leads) {
    const numCalls = 1 + Math.floor(Math.random() * 5); // 1–5 per lead

    for (let i = 0; i < numCalls; i++) {
      const type = callTypes[Math.floor(Math.random() * callTypes.length)];
      const status =
        callStatuses[Math.floor(Math.random() * callStatuses.length)];
      const notes = callNotes[Math.floor(Math.random() * callNotes.length)];

      // duration only valid for completed calls (model enforces min: 1)
      const duration =
        status === "completed" ? 1 + Math.floor(Math.random() * 45) : undefined;

      docs.push({
        leadId: lead._id,
        type,
        status,
        ...(notes && { notes }),
        ...(duration !== undefined && { duration }),
      });
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log("📞 SEED CALLS");
  console.log("═".repeat(60));
  console.log(`  Leads found:   ${leads.length}`);
  console.log(`  Calls to seed: ${docs.length}`);
  console.log(`  Mode:          ${shouldCommit ? "🔴 COMMIT" : "📋 DRY RUN"}`);
  console.log("═".repeat(60));

  if (!shouldCommit) {
    console.log("\n💡 Dry run complete. To write, run:");
    console.log("   node seedCalls.js --commit\n");
    await mongoose.disconnect();
    return;
  }

  await Call.deleteMany({});
  await Call.insertMany(docs);

  console.log(
    `\n✅ Inserted ${docs.length} calls across ${leads.length} leads.\n`,
  );
  await mongoose.disconnect();
}

seedCalls().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
