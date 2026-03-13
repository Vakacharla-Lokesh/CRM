import { runTenantCleanup } from "./tenantCleanupService.js";
import { logger } from "../utils/logger.js";

const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function startTenantCleanupCron() {
  // Run once at server startup to catch any pending tenants immediately
  await runTenantCleanup();

  // Then schedule daily runs
  setInterval(() => {
    runTenantCleanup().catch((err) =>
      logger.error(`[TenantCleanup] Cron error: ${err.message}`),
    );
  }, INTERVAL_MS);

  logger.info("[TenantCleanup] Cron scheduled (every 24 hours).");
}
