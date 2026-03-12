import { randomUUID } from "crypto";
import { requestStore } from "../utils/requestContext.js";

export function requestContextMiddleware(req, res, next) {
  const requestId = randomUUID();

  req.requestId = requestId;

  res.setHeader("X-Request-Id", requestId);

  requestStore.run({ requestId }, next);
}
