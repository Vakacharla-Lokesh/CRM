// ─── Job Registry ─────────────────────────────────────────────────────────────
//
// Static mapping of jobType → worker handler.
// Initialized once at module load. Prevents duplicate registration
// and arbitrary handler execution.

import { isValidJobType } from "./job.types.js";

const _handlers = new Map();

// ─── Register ─────────────────────────────────────────────────────────────────

function register(jobType, handler) {
  if (!jobType || typeof handler !== "function") {
    throw new Error(
      "[JobRegistry] register() requires a jobType string and a handler function",
    );
  }

  if (!isValidJobType(jobType)) {
    throw new Error(`[JobRegistry] Unknown job type: "${jobType}"`);
  }

  if (_handlers.has(jobType)) {
    throw new Error(
      `[JobRegistry] Duplicate registration for job type: "${jobType}"`,
    );
  }

  _handlers.set(jobType, handler);
  console.log(`[JobRegistry] Registered handler for: ${jobType}`);
}

// ─── Get Handler ──────────────────────────────────────────────────────────────

function getHandler(jobType) {
  const handler = _handlers.get(jobType);
  if (!handler) {
    throw new Error(
      `[JobRegistry] No handler registered for job type: "${jobType}"`,
    );
  }
  return handler;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function getAllTypes() {
  return Array.from(_handlers.keys());
}

function isRegistered(jobType) {
  return _handlers.has(jobType);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const jobRegistry = {
  register,
  getHandler,
  getAllTypes,
  isRegistered,
};

export default jobRegistry;
