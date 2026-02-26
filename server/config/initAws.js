/**
 * @deprecated
 * This file is a backward-compatibility shim.
 *
 * New code must import directly from `../services/aws/initAwsResources.js`:
 *   import { ensureAwsInitialized, queueUrls } from '../services/aws/initAwsResources.js';
 *
 * Workers must use `services/workers/index.js` as their entry point,
 * not `workers/worker.js` or `workers/exportWorker.js`.
 */

export {
  ensureAwsInitialized as initAwsResources,
  queueUrls,
  BUCKETS,
  QUEUES,
} from "../services/aws/initAwsResources.js";

import { queueUrls } from "../services/aws/initAwsResources.js";

// Lazy getters so these are always current after ensureAwsInitialized() resolves
export const QUEUE_URL = new Proxy(queueUrls, {
  get(target, prop) {
    return prop === Symbol.toPrimitive || prop === "toString"
      ? () => target.offlineWrites
      : target[prop];
  },
});

export const EXPORT_QUEUE_URL = new Proxy(queueUrls, {
  get(target, prop) {
    return prop === Symbol.toPrimitive || prop === "toString"
      ? () => target.exportData
      : target[prop];
  },
});
