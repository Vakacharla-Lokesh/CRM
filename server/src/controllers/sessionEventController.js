import SessionEvent from "../models/sessionEventModel.js";
import { asyncCatch } from "../utils/asyncCatch.js";
import AppError from "../utils/appError.js";

export const batchCreateSessionEvents = asyncCatch(async (req, res) => {
  const { sessionId, tenantId, visitorName, visitorEmail, events } = req.body;

  if (
    !sessionId ||
    !tenantId ||
    !Array.isArray(events) ||
    events.length === 0
  ) {
    throw new AppError(
      "sessionId, tenantId, and a non-empty events array are required",
      400,
    );
  }

  const docs = events.map((e) => ({
    sessionId,
    tenantId,
    visitorName: visitorName || null,
    visitorEmail: visitorEmail || null,
    type: e.type,
    data: e.data || {},
    timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
  }));

  await SessionEvent.insertMany(docs, { ordered: false });

  res.status(201).json({ success: true, inserted: docs.length });
});
