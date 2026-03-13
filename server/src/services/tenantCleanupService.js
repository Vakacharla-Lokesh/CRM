import tenantModel from "../modules/tenants/models/tenantModel.js";
import userModel from "../modules/users/models/userModel.js";
import {roleModel} from "../modules/roles/index.js";
import leadModel from "../modules/leads/models/leadModel.js";
import organizationModel from "../modules/organizations/models/organizationModel.js";
import dealModel from "../modules/deals/models/dealModel.js";
import {Campaign as campaignModel} from "../modules/campaign/models/campaignModel.js";
import campaignTemplateModel from "../modules/campaign/models/campaignTemplateModel.js";
import workflowModel from "../modules/workflows/models/workflowModel.js";
import attachmentModel from "../modules/attachments/models/attachmentModel.js";
import commentModel from "../modules/comments/models/commentModel.js";
import callModel from "../modules/calls/models/callModel.js";
import { s3Manager } from "./aws/s3Manager.js";
import { BUCKETS } from "./aws/initAwsResources.js";
import { logger } from "../utils/logger.js";

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

export async function runTenantCleanup() {
  const cutoff = new Date(Date.now() - SIXTY_DAYS_MS);

  const expiredTenants = await tenantModel
    .find({ isActive: false, deletedAt: { $lte: cutoff } })
    .lean();

  if (expiredTenants.length === 0) {
    logger.info("[TenantCleanup] No expired tenants to clean up.");
    return;
  }

  logger.info(
    `[TenantCleanup] Found ${expiredTenants.length} tenant(s) to hard-delete.`,
  );

  for (const tenant of expiredTenants) {
    const tenantId = tenant._id;

    try {
      logger.info(`[TenantCleanup] Processing tenant ${tenantId}…`);

      // 1. Find all lead IDs for this tenant
      const leads = await leadModel.find({ tenantId }).select("_id").lean();
      const leadIds = leads.map((l) => l._id);

      // 2. Delete S3 attachments
      const attachments = await attachmentModel
        .find({ leadId: { $in: leadIds } })
        .select("s3Key")
        .lean();

      for (const att of attachments) {
        try {
          await s3Manager.deleteFile(BUCKETS.leads, att.s3Key);
        } catch (err) {
          logger.warn(
            `[TenantCleanup] Failed to delete S3 object ${att.s3Key}: ${err.message}`,
          );
        }
      }

      // 3. Delete lead-linked data
      await attachmentModel.deleteMany({ leadId: { $in: leadIds } });
      await commentModel.deleteMany({ leadId: { $in: leadIds } });
      await callModel.deleteMany({ leadId: { $in: leadIds } });

      // 4. Delete tenant-scoped entities
      await leadModel.deleteMany({ tenantId });
      await dealModel.deleteMany({ tenantId });
      await organizationModel.deleteMany({ tenantId });
      await campaignModel.deleteMany({ tenantId });
      await campaignTemplateModel.deleteMany({ tenantId });
      await workflowModel.deleteMany({ tenantId });
      await roleModel.deleteMany({ tenantId });
      await userModel.deleteMany({ tenantId });

      // 5. Hard-delete the tenant itself
      await tenantModel.findByIdAndDelete(tenantId);

      logger.info(`[TenantCleanup] Tenant ${tenantId} fully deleted.`);
    } catch (err) {
      logger.error(
        `[TenantCleanup] Error deleting tenant ${tenantId}: ${err.message}`,
      );
    }
  }
}
