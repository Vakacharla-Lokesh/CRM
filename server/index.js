import { config } from "dotenv";
config();

import app from "./src/server.js";

import { initAwsResources } from "./config/initAws.js";
import { startLeadReminderJob } from "./jobs/leadAlertJobs.js";

await initAwsResources();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  startLeadReminderJob();
});
