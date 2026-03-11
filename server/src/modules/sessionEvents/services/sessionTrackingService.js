import SessionEvent from "../models/sessionEventModel.js";
import { createLead } from "../../leads/services/leadService.js";
import { getNextAssignee } from "../../../services/roundRobinService.js";
import { notifyUser, notificationTypes } from "../../../services/notificationService.js";

const SCORE_THRESHOLD = 50;
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

const RETRY_DELAYS_MS = [2000, 4000, 8000, 15000, 30000];

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

const convertedSessions = new Map();

const sessionHasConverted = (sessionId) => {
  const entry = convertedSessions.get(sessionId);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    convertedSessions.delete(sessionId);
    return false;
  }
  return true;
};

const markSessionConverted = (sessionId) => {
  convertedSessions.set(sessionId, { expiresAt: Date.now() + SESSION_TTL_MS });
};

const unmarkSessionConverted = (sessionId) => {
  convertedSessions.delete(sessionId);
};

const evictExpiredSessions = () => {
  const now = Date.now();
  for (const [id, entry] of convertedSessions) {
    if (now > entry.expiresAt) convertedSessions.delete(id);
  }
};

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
  if (sessionHasConverted(sessionId)) {
    console.log(`[Tracking] Session ${sessionId} already converted — skipping`);
    return;
  }

  markSessionConverted(sessionId);

  try {
    const assignedTo = await getNextAssignee(tenantId);

    if (!assignedTo) {
      console.warn(
        `[Tracking] No assignee found for tenant ${tenantId} — lead not created`,
      );
      unmarkSessionConverted(sessionId);
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
    unmarkSessionConverted(sessionId);
    console.error(
      `[Tracking] Failed to create auto-lead for session ${sessionId}:`,
      err,
    );
  }
};

const processEvent = async (newEvent) => {
  const { sessionId, tenantId, visitorName, visitorEmail } = newEvent;

  if (sessionHasConverted(sessionId)) return;

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
let isStopped = false;
let retryCount = 0;

const openStream = () => {
  if (isStopped) return;

  changeStream = SessionEvent.watch([{ $match: { operationType: "insert" } }], {
    fullDocument: "updateLookup",
  });

  changeStream.on("change", async (change) => {
    retryCount = 0;
    evictExpiredSessions();
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
    scheduleReconnect();
  });

  changeStream.on("close", () => {
    if (isStopped) {
      console.log("[Tracking] Change stream closed intentionally");
      return;
    }
    console.warn(
      "[Tracking] Change stream closed unexpectedly — will reconnect",
    );
    scheduleReconnect();
  });

  console.log("[Tracking] Change stream watching SessionEvents");
};

const scheduleReconnect = () => {
  if (isStopped) return;

  const delayMs =
    RETRY_DELAYS_MS[Math.min(retryCount, RETRY_DELAYS_MS.length - 1)];
  retryCount++;

  console.log(
    `[Tracking] Reconnecting in ${delayMs / 1000}s (attempt ${retryCount})...`,
  );

  setTimeout(() => {
    if (!isStopped) {
      console.log("[Tracking] Attempting to reopen change stream...");
      openStream();
    }
  }, delayMs);
};

export const startSessionTracking = () => {
  isStopped = false;
  retryCount = 0;
  openStream();
};

export const stopSessionTracking = () => {
  isStopped = true;
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
  if (sessionHasConverted(sessionId)) return;
  const events = await SessionEvent.find({ sessionId }).lean();
  const score = scoreSession(events);
  if (score >= SCORE_THRESHOLD) {
    await createAutoLead(sessionId, tenantId, visitorName, visitorEmail, score);
  }
};
