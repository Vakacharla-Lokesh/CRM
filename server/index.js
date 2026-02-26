import { config } from "dotenv";
config();

import app from "./src/server.js";

import { ensureAwsInitialized } from "./services/aws/initAwsResources.js";
import { startAllCronJobs } from "./services/cron/index.js";

await ensureAwsInitialized();

app.listen(process.env.PORT, () => {
  console.log(`[Server] Running on port ${process.env.PORT}`);
  startAllCronJobs();
});
