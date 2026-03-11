import asyncCatch from "../../../utils/asyncCatch.js";
import mongoose from "mongoose";
import {
  saveAnalyticsSnapshot,
  getAllTenantsWithUsers,
  TENANT_SCOPE_KEY,
} from "../services/analyticsSnapshotService.js";

export const triggerAnalyticsSnapshot = asyncCatch(async (req, res) => {
  const { tenantId, userId } = req.body;

  if (tenantId && userId) {
    const tid = new mongoose.Types.ObjectId(tenantId);
    const uid = new mongoose.Types.ObjectId(userId);

    await saveAnalyticsSnapshot(
      tid,
      uid.toString(),
      { tenantId: tid, assignedTo: uid },
      { tenantId: tid, userId: uid },
    );

    return res.json({
      success: true,
      message: `User snapshot triggered — tenant: ${tenantId}, user: ${userId}`,
    });
  }

  if (tenantId) {
    const tid = new mongoose.Types.ObjectId(tenantId);
    const tenantsWithUsers = await getAllTenantsWithUsers();
    const target = tenantsWithUsers.find(
      (t) => t.tenantId.toString() === tid.toString(),
    );

    if (!target) {
      return res
        .status(404)
        .json({ success: false, message: "Tenant not found or inactive" });
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    try {
      await saveAnalyticsSnapshot(
        tid,
        TENANT_SCOPE_KEY,
        { tenantId: tid },
        { tenantId: tid },
      );
      successCount++;
    } catch (err) {
      failCount++;
      errors.push({ scope: "tenant", error: err.message });
    }

    for (const uid of target.userIds) {
      try {
        await saveAnalyticsSnapshot(
          tid,
          uid.toString(),
          { tenantId: tid, assignedTo: uid },
          { tenantId: tid, userId: uid },
        );
        successCount++;
      } catch (err) {
        failCount++;
        errors.push({ scope: uid.toString(), error: err.message });
      }
    }

    return res.json({
      success: true,
      message: `Tenant snapshot run complete. Success: ${successCount}, Failed: ${failCount}`,
      errors: errors.length > 0 ? errors : undefined,
    });
  }

  const tenants = await getAllTenantsWithUsers();
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  for (const { tenantId: tid, userIds } of tenants) {
    try {
      await saveAnalyticsSnapshot(
        tid,
        TENANT_SCOPE_KEY,
        { tenantId: tid },
        { tenantId: tid },
      );
      successCount++;
    } catch (err) {
      failCount++;
      errors.push({ scope: "tenant", tenantId: tid, error: err.message });
    }

    for (const uid of userIds) {
      try {
        await saveAnalyticsSnapshot(
          tid,
          uid.toString(),
          { tenantId: tid, assignedTo: uid },
          { tenantId: tid, userId: uid },
        );
        successCount++;
      } catch (err) {
        failCount++;
        errors.push({
          scope: uid.toString(),
          tenantId: tid,
          error: err.message,
        });
      }
    }
  }

  res.json({
    success: true,
    message: `Full snapshot run complete. Success: ${successCount}, Failed: ${failCount}`,
    errors: errors.length > 0 ? errors : undefined,
  });
});
