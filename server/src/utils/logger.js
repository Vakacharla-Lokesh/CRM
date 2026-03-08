import { getRequestContext } from "./requestContext.js";

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";
const MIN_LEVEL = LEVELS[LOG_LEVEL] ?? LEVELS.info;

function shouldLog(level) {
  return (LEVELS[level] ?? LEVELS.info) >= MIN_LEVEL;
}

function buildEntry(level, message, meta = {}) {
  const ctx = getRequestContext();

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (ctx.requestId) entry.requestId = ctx.requestId;
  if (ctx.traceId) entry.traceId = ctx.traceId;
  if (ctx.userId) entry.userId = ctx.userId;
  if (ctx.tenantId) entry.tenantId = ctx.tenantId;
  if (ctx.role) entry.role = ctx.role;

  if (ctx.jobType) entry.jobType = ctx.jobType;

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
  debug: (message, meta) => output("debug", message, meta),
  info: (message, meta) => output("info", message, meta),
  warn: (message, meta) => output("warn", message, meta),
  error: (message, meta) => output("error", message, meta),
};

export default logger;
