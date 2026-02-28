import { getRequestContext } from "./requestContext.js";

/**
 * Structured JSON logger.
 *
 * Every log line automatically includes whatever context is present in the
 * AsyncLocalStorage store at call time — so controllers, services, and workers
 * get requestId / userId / tenantId on every log for free, with no manual
 * argument threading.
 *
 * Levels (ascending severity): debug < info < warn < error
 * Set LOG_LEVEL env var to control minimum level (default: "info").
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";
const MIN_LEVEL = LEVELS[LOG_LEVEL] ?? LEVELS.info;

function shouldLog(level) {
  return (LEVELS[level] ?? LEVELS.info) >= MIN_LEVEL;
}

/**
 * Builds a structured log entry, merging the current request/job context
 * from AsyncLocalStorage with any caller-supplied metadata.
 *
 * @param {"debug"|"info"|"warn"|"error"} level
 * @param {string} message
 * @param {Record<string, unknown>} [meta]
 */
function buildEntry(level, message, meta = {}) {
  const ctx = getRequestContext();

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  // Attach request-scoped context when available
  if (ctx.requestId) entry.requestId = ctx.requestId;
  if (ctx.traceId) entry.traceId = ctx.traceId;
  if (ctx.userId) entry.userId = ctx.userId;
  if (ctx.tenantId) entry.tenantId = ctx.tenantId;
  if (ctx.role) entry.role = ctx.role;

  // Attach job-scoped context when available
  if (ctx.jobType) entry.jobType = ctx.jobType;

  // Merge caller-supplied metadata last so it can override if needed
  Object.assign(entry, meta);

  return entry;
}

function output(level, message, meta) {
  if (!shouldLog(level)) return;

  const entry = buildEntry(level, message, meta);
  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  /** Verbose diagnostic info — only emitted when LOG_LEVEL=debug */
  debug: (message, meta) => output("debug", message, meta),
  /** Normal operational events */
  info: (message, meta) => output("info", message, meta),
  /** Recoverable issues that should be investigated */
  warn: (message, meta) => output("warn", message, meta),
  /** Errors that require attention */
  error: (message, meta) => output("error", message, meta),
};

export default logger;
