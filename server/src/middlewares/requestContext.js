import { randomUUID } from "crypto";
import { requestStore } from "../utils/requestContext.js";

/**
 * requestContextMiddleware
 *
 * Must be mounted BEFORE Morgan and all route handlers so that:
 *   1. A unique requestId is generated for every incoming HTTP request.
 *   2. The requestId is attached to `req.requestId` (readable by Morgan tokens).
 *   3. The requestId is sent back to the client via `X-Request-Id` response header
 *      so engineers can correlate client errors with server logs.
 *   4. The entire request lifecycle runs inside AsyncLocalStorage.run(), meaning
 *      any code downstream — controllers, services, DB queries — can call
 *      logger.info() and automatically get the requestId in the log entry
 *      without it needing to be passed as a function argument.
 *
 * User context (userId, tenantId, role) is added to the store later by
 * authenticateRequest (auth.js) once the JWT has been verified.
 */
export function requestContextMiddleware(req, res, next) {
  const requestId = randomUUID();

  // Make requestId available on req so Morgan custom tokens can read it
  req.requestId = requestId;

  // Return the requestId to the client — useful for support & correlation
  res.setHeader("X-Request-Id", requestId);

  // Run the rest of the request inside the store context
  requestStore.run({ requestId }, next);
}
