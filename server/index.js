import { config } from "dotenv";
config();

import httpServer from "./src/server.js";

import { ensureAwsInitialized } from "./src/services/aws/initAwsResources.js";
import { queueService } from "./src/services/aws/queue/queueService.js";
import { startSessionTracking } from "./src/services/sessionTrackingService.js";
import { processAllPendingEmails } from "./src/services/campaignService.js";

try {
  await ensureAwsInitialized();
  console.log("[AWS] AWS resources initialized successfully");
} catch (error) {
  console.warn(
    "[AWS] Warning: Failed to initialize AWS resources. LocalStack may not be running.",
    error.message,
  );
  console.warn("[AWS] Server will continue without AWS functionality");
}

try {
  queueService.bootstrap();
  console.log("[Queue] Queue service bootstrapped successfully");
} catch (error) {
  console.warn(
    "[Queue] Warning: Failed to bootstrap queue service.",
    error.message,
  );
  console.warn("[Queue] Server will continue without queue functionality");
}

try {
  await processAllPendingEmails();
} catch (error) {
  console.warn(
    "[Campaign] Warning: Failed to process pending campaign emails.",
    error.message,
  );
}

try {
  await startSessionTracking();
  console.log("[Tracking] Session tracking service started");
} catch (error) {
  console.warn(
    "[Tracking] Warning: Failed to start session tracking.",
    error.message,
  );
  console.warn("[Tracking] Server will continue without session tracking");
}

httpServer.listen(process.env.PORT, () => {
  console.log(`[Server] Running on port ${process.env.PORT}`);
  console.log(`[Socket.IO] Real-time notifications server initialized`);
});
