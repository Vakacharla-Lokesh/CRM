#!/usr/bin/env node

/**
 * seedComments.js
 *
 * Seeds Comments collection using leads already present in the DB.
 * Does NOT re-seed leads — reads existing leads directly.
 *
 * Usage:
 *   node seedComments.js           # Dry run (preview count)
 *   node seedComments.js --commit  # Write to DB
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

import Comment from "../modules/comments/models/commentModel.js";
import Lead from "../modules/leads/models/leadModel.js";

const commentTitles = [
  "Initial outreach made",
  "Follow-up scheduled",
  "Demo completed",
  "Proposal sent",
  "Waiting for decision",
  "Budget discussed",
  "Stakeholder introduced",
  "Contract review pending",
  "Requirements gathered",
  "Technical questions answered",
  "Pricing negotiated",
  "Referral mentioned",
  "Competitor comparison raised",
  "Urgency confirmed",
  "Next steps agreed",
];

const commentDescriptions = [
  "Lead responded positively and showed interest in a product demo.",
  "Sent follow-up email with product brochure and pricing overview.",
  "Demo went well; the lead asked detailed questions about integrations.",
  "Proposal shared via email. Awaiting feedback by end of week.",
  "Lead is reviewing internally. Expected decision by next Tuesday.",
  "Budget is aligned. Lead needs sign-off from their director.",
  "Introduced to the procurement team. New decision maker involved.",
  "Legal team is reviewing the draft contract. Minor revisions expected.",
  "Detailed requirements captured. Shared with technical team.",
  "Addressed concerns around data security and uptime SLA.",
  "Agreed on a 12-month contract with a 10% discount applied.",
  "Lead was referred by an existing customer from the same industry.",
  "Lead comparing us with two competitors. Needs case studies.",
  "Lead mentioned a Q3 deadline. Decision needs to happen this month.",
  "Action items agreed. Lead to confirm internally and respond by Friday.",
  null,
  null,
];

async function seedComments() {
  const shouldCommit = process.argv.includes("--commit");

  await mongoose.connect(process.env.DB_URI);

  const leads = await Lead.find({}, { _id: 1 }).lean();

  if (leads.length === 0) {
    console.log("❌ No leads found in DB. Run seedLeads first.");
    process.exit(1);
  }

  const docs = [];

  for (const lead of leads) {
    const numComments = 2 + Math.floor(Math.random() * 5); // 2–6 per lead

    for (let i = 0; i < numComments; i++) {
      const title =
        commentTitles[Math.floor(Math.random() * commentTitles.length)];
      const description =
        commentDescriptions[
          Math.floor(Math.random() * commentDescriptions.length)
        ];

      docs.push({
        leadId: lead._id,
        title,
        ...(description && { description }),
      });
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log("💬 SEED COMMENTS");
  console.log("═".repeat(60));
  console.log(`  Leads found:      ${leads.length}`);
  console.log(`  Comments to seed: ${docs.length}`);
  console.log(
    `  Mode:             ${shouldCommit ? "🔴 COMMIT" : "📋 DRY RUN"}`,
  );
  console.log("═".repeat(60));

  if (!shouldCommit) {
    console.log("\n💡 Dry run complete. To write, run:");
    console.log("   node seedComments.js --commit\n");
    await mongoose.disconnect();
    return;
  }

  await Comment.deleteMany({});
  await Comment.insertMany(docs);

  console.log(
    `\n✅ Inserted ${docs.length} comments across ${leads.length} leads.\n`,
  );
  await mongoose.disconnect();
}

seedComments().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
