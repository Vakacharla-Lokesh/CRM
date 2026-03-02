import { config } from "dotenv";
config();

import httpServer from "./src/server.js";

import { ensureAwsInitialized } from "./src/services/aws/initAwsResources.js";
import { queueService } from "./src/services/aws/queue/queue.service.js";

// Initialize AWS resources with error handling
try {
  await ensureAwsInitialized();
  console.log("[AWS] AWS resources initialized successfully");
} catch (error) {
  console.warn(
    "[AWS] Warning: Failed to initialize AWS resources. LocalStack may not be running.",
    error.message
  );
  console.warn("[AWS] Server will continue without AWS functionality");
}

// Initialize queue service with error handling
try {
  queueService.bootstrap();
  console.log("[Queue] Queue service bootstrapped successfully");
} catch (error) {
  console.warn(
    "[Queue] Warning: Failed to bootstrap queue service.",
    error.message
  );
  console.warn("[Queue] Server will continue without queue functionality");
}

httpServer.listen(process.env.PORT, () => {
  console.log(`[Server] Running on port ${process.env.PORT}`);
  console.log(`[Socket.IO] Real-time notifications server initialized`);
});
