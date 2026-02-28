import { AsyncLocalStorage } from "async_hooks";

/**
 * AsyncLocalStorage instance that holds per-request (or per-job) context.
 *
 * Populated by:
 *   - requestContextMiddleware  → API requests  (requestId, userId, tenantId, role)
 *   - jobProcessor.lambda.js    → background jobs (requestId, traceId, tenantId, userId, jobType)
 *
 * Any code in the call chain (controllers, services, DB helpers) can call
 * getRequestContext() to read the current context without it needing to be
 * threaded through function arguments.
 */
export const requestStore = new AsyncLocalStorage();

/**
 * Returns the current context object from the store.
 * Returns an empty object when called outside a store scope
 * (e.g. startup logs, seeding scripts).
 *
 * @returns {{ requestId?: string, traceId?: string, userId?: string, tenantId?: string, role?: string, jobType?: string }}
 */
export function getRequestContext() {
  return requestStore.getStore() ?? {};
}
