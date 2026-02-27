import { config } from "dotenv";
config();

import app from "./src/server.js";

import { ensureAwsInitialized } from "./src/services/aws/initAwsResources.js";
import { queueService } from "./src/infrastructure/queue/queue.service.js";

await ensureAwsInitialized();
queueService.bootstrap();

app.listen(process.env.PORT, () => {
  console.log(`[Server] Running on port ${process.env.PORT}`);
});
