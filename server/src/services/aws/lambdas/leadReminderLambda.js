import { subDays, startOfDay, endOfDay } from "date-fns";
import LeadModel from "../../../modules/leads/models/leadModel.js";
import emailController from "../../../modules/emails/controllers/emailController.js";
import { JOB_TYPES } from "../../../utils/jobTypes.js";
import { logger } from "../../../utils/logger.js";
import { requestStore } from "../../../utils/requestContext.js";
import mongoose from "mongoose";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../../../.env") });

export const jobType = JOB_TYPES.LEAD_REMINDER;

export async function handler(_payload, context) {
  const { tenantId } = context;

  logger.info("[LeadReminderWorker] Running lead reminder");

  const targetDate = subDays(new Date(), 14);
  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const leads = await LeadModel.find({
    status: "new",
    createdAt: { $gte: start, $lte: end },
  })
    .populate("userId", "email firstName")
    .lean();

  let sentCount = 0;

  for (const lead of leads) {
    if (!lead.userId?.email) continue;

    const leadName = `${lead.firstName} ${lead.lastName || ""}`.trim();

    await emailController.sendLeadReminderMail({
      _id: lead._id,
      to: lead.userId.email,
      userName: lead.userId.firstName,
      leadName,
    });

    sentCount++;
  }

  logger.info("[LeadReminderWorker] Reminder run complete", { sentCount });

  return {
    success: true,
    shouldRetry: false,
    message: `Sent ${sentCount} lead reminder emails`,
  };
}

let _dbConnected = false;

async function ensureDb() {
  if (_dbConnected) return;
  const uri = process.env.DB_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("[LeadReminderWorker Lambda] No MongoDB URI found");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
    logger.info("[LeadReminderWorker Lambda] Connected to MongoDB");
  }
  _dbConnected = true;
}

export const lambdaHandler = async (event, _context) => {
  await ensureDb();

  const records = event.Records;

  const context = {
    tenantId: event.detail?.tenantId || "system-scheduler",
    userId: null,
    requestId: event.detail?.requestId || "scheduled-run",
    traceId: event.detail?.traceId || null,
  };

  if (records) {
    const batchItemFailures = [];

    for (const record of records) {
      try {
        const body = JSON.parse(record.body);
        const recordContext = {
          tenantId: body.tenantId || context.tenantId,
          userId: null,
          requestId: body.payload?._meta?.requestId || record.messageId,
          traceId: body.payload?._meta?.traceId || null,
        };

        const result = await new Promise((resolve, reject) => {
          requestStore.run(
            {
              ...recordContext,
              tenantId: recordContext.tenantId?.toString(),
              jobType,
            },
            () =>
              handler(body.payload || body, recordContext)
                .then(resolve)
                .catch(reject),
          );
        });

        if (result.shouldRetry) {
          batchItemFailures.push({ itemIdentifier: record.messageId });
        }
      } catch (err) {
        logger.error("[LeadReminderWorker Lambda] Record failed", {
          error: err.message,
          messageId: record.messageId,
        });
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }

    return { batchItemFailures };
  }

  const result = await new Promise((resolve, reject) => {
    requestStore.run(
      { ...context, tenantId: context.tenantId?.toString(), jobType },
      () =>
        handler(event.detail || {}, context)
          .then(resolve)
          .catch(reject),
    );
  });

  return { statusCode: 200, body: JSON.stringify(result) };
};
