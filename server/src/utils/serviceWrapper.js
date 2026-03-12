import AppError from "./appError.js";
import { logger } from "./logger.js";

export const wrapServiceFn = (fn) => {
  return async function wrappedServiceFn(...args) {
    try {
      return await fn.apply(this, args);
    } catch (err) {
      if (err instanceof AppError) throw err;
      logger.error(
        `[Service] Unexpected error in ${fn.name || "anonymous"}: ${err.message}`,
        { stack: err.stack },
      );
      throw new AppError(
        "An unexpected error occurred. Please try again.",
        500,
      );
    }
  };
};

export const wrapService = (serviceObj) => {
  const wrapped = {};
  for (const [key, value] of Object.entries(serviceObj)) {
    wrapped[key] = typeof value === "function" ? wrapServiceFn(value) : value;
  }
  return wrapped;
};
