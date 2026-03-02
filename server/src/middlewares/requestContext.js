import { randomUUID } from "crypto";
import { requestStore } from "../utils/requestContext.js";

export function requestContextMiddleware(req, res, next) {
  const requestId = randomUUID();

  // Make requestId available on req so Morgan custom tokens can read it
  req.requestId = requestId;

  // Return the requestId to the client — useful for support & correlation
  res.setHeader("X-Request-Id", requestId);

  requestStore.run({ requestId }, next);
}
