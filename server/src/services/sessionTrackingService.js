import mongoose from "mongoose";
import SessionEvent from "../models/sessionEventModel.js";
import { createLead } from "./leadService.js";
import { getNextAssignee } from "./roundRobinService.js";
import { notifyUser } from "./notificationService.js";
import { notificationTypes } from "./notificationService.js";

const SCORE_THRESHOLD = 50;

const SCORING_RULES = [
  {
    id: "dwell_30",
    check: (events) => {
      const enter = events.find((e) => e.type === "page_enter");
      const exit = events.find((e) => e.type === "page_exit");
      if (!enter || !exit) return false;
      const dwell =
        (new Date(exit.timestamp) - new Date(enter.timestamp)) / 1000;
      return dwell >= 30 && dwell < 120;
    },
    points: 10,
  },
  {
    id: "dwell_120",
    check: (events) => {
      const enter = events.find((e) => e.type === "page_enter");
      const exit = events.find((e) => e.type === "page_exit");
      if (!enter || !exit) return false;
      const dwell =
        (new Date(exit.timestamp) - new Date(enter.timestamp)) / 1000;
      return dwell >= 120;
    },
    points: 20,
  },
  {
    id: "scroll_50",
    check: (events) =>
      events.some((e) => e.type === "scroll_depth" && e.data?.depth >= 50),
    points: 15,
  },
  {
    id: "scroll_75",
    check: (events) =>
      events.some((e) => e.type === "scroll_depth" && e.data?.depth >= 75),
    points: 25,
  },
  {
    id: "pricing_view",
    check: (events) =>
      events.some(
        (e) => e.type === "section_view" && e.data?.section === "pricing",
      ),
    points: 20,
  },
  {
    id: "cta_click",
    check: (events) => events.some((e) => e.type === "cta_click"),
    points: 30,
  },
  {
    id: "email_focus",
    check: (events) =>
      events.some((e) => e.type === "field_focus" && e.data?.field === "email"),
    points: 40,
  },
];

const convertedSessions = new Set();

const scoreSession = (events) => {
  let total = 0;
  for (const rule of SCORING_RULES) {
    if (rule.check(events)) {
      total += rule.points;
      console.log(`[Tracking] Rule "${rule.id}" matched: +${rule.points}`);
    }
  }
  return total;
};

const createAutoLead = async (
  sessionId,
  tenantId,
  visitorName,
  visitorEmail,
  score,
) => {
  if (convertedSessions.has(sessionId)) {
    console.log(`[Tracking] Session ${sessionId} already converted — skipping`);
    return;
  }

  convertedSessions.add(sessionId);

  try {
    const assignedTo = await getNextAssignee(tenantId);

    if (!assignedTo) {
      console.warn(
        `[Tracking] No assignee found for tenant ${tenantId} — lead not created`,
      );
      convertedSessions.delete(sessionId);
      return;
    }

    const lead = await createLead({
      firstName: visitorName || "Website Visitor",
      email: visitorEmail || undefined,
      tenantId,
      createdBy: assignedTo,
      assignedTo,
      source: "Website",
      status: "New",
    });

    console.log(
      `[Tracking] Auto-lead created: ${lead._id} | session: ${sessionId} | score: ${score}`,
    );

    notifyUser(assignedTo.toString(), {
      type: notificationTypes.LEAD_ASSIGNED,
      title: "New Lead Auto-Assigned",
      message: `A website visitor scored ${score} pts. Lead "${lead.firstName}" assigned to you.`,
      metadata: {
        entityId: lead._id,
        entityType: "lead",
        action: "lead:assigned",
        sessionId,
        sessionScore: score,
      },
    });
  } catch (err) {
    convertedSessions.delete(sessionId);
    console.error(
      `[Tracking] Failed to create auto-lead for session ${sessionId}:`,
      err,
    );
  }
};

const processEvent = async (newEvent) => {
  const { sessionId, tenantId, visitorName, visitorEmail } = newEvent;

  if (convertedSessions.has(sessionId)) return;

  const events = await SessionEvent.find({ sessionId }).lean();
  const score = scoreSession(events);

  console.log(
    `[Tracking] Session ${sessionId} score: ${score}/${SCORE_THRESHOLD}`,
  );

  if (score >= SCORE_THRESHOLD) {
    await createAutoLead(sessionId, tenantId, visitorName, visitorEmail, score);
  }
};

let changeStream = null;

export const startSessionTracking = async () => {
  try {
    await SessionEvent.createCollection();
    console.log("[Tracking] SessionEvents collection ready");
  } catch (err) {
    if (!err.message?.includes("already exists")) {
      console.error("[Tracking] Error ensuring collection:", err.message);
    }
  }

  changeStream = SessionEvent.watch([{ $match: { operationType: "insert" } }], {
    fullDocument: "updateLookup",
  });

  changeStream.on("change", async (change) => {
    try {
      const doc = change.fullDocument;
      if (!doc) return;
      await processEvent(doc);
    } catch (err) {
      console.error("[Tracking] Change stream processing error:", err);
    }
  });

  changeStream.on("error", (err) => {
    console.error("[Tracking] Change stream error:", err);
  });

  changeStream.on("close", () => {
    console.warn("[Tracking] Change stream closed");
  });

  console.log("[Tracking] Change stream watching SessionEvents");
};

export const stopSessionTracking = () => {
  if (changeStream) {
    changeStream.close();
    changeStream = null;
    console.log("[Tracking] Change stream stopped");
  }
};

export const evaluateSession = async (
  sessionId,
  tenantId,
  visitorName,
  visitorEmail,
) => {
  if (convertedSessions.has(sessionId)) return;
  const events = await SessionEvent.find({ sessionId }).lean();
  const score = scoreSession(events);
  if (score >= SCORE_THRESHOLD) {
    await createAutoLead(sessionId, tenantId, visitorName, visitorEmail, score);
  }
};
