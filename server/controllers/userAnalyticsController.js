import asyncCatch from "../utils/asyncCatch.js";
import {
  getUserDashboard,
  updateDashboardLayout,
  computeChartData,
} from "../services/userAnalyticsService.js";

/**
 * GET /api/user-analytics
 * Returns the user's saved dashboard layout plus computed chart data for each widget.
 */
export const getUserAnalyticsDashboard = asyncCatch(async (req, res) => {
  const userId = req.user.userId;
  const tenantId = req.user.tenantId || null;

  const dashboard = await getUserDashboard(userId, tenantId);

  // Compute chart data for all widgets in parallel (batch — no N+1)
  const widgetsWithData = await Promise.all(
    dashboard.layout.map(async (widget) => {
      const data = await computeChartData(widget, tenantId);
      return { ...widget, data };
    }),
  );

  res.json({ layout: widgetsWithData });
});

/**
 * PUT /api/user-analytics
 * Saves the full layout array for the user's analytics dashboard.
 */
export const saveUserAnalyticsDashboard = asyncCatch(async (req, res) => {
  const userId = req.user.userId;
  const tenantId = req.user.tenantId || null;
  const { layout } = req.body;

  if (!Array.isArray(layout)) {
    return res.status(400).json({ message: "layout must be an array" });
  }

  // Validate each widget minimally before persisting
  const VALID_TYPES = ["bar", "line", "pie", "area", "number", "table"];
  const VALID_ENTITIES = ["leads", "deals", "organizations"];
  const VALID_METRICS = ["count", "sum", "avg"];

  for (const widget of layout) {
    if (!VALID_TYPES.includes(widget.type)) {
      return res.status(400).json({ message: `Invalid widget type: ${widget.type}` });
    }
    if (!VALID_ENTITIES.includes(widget.entity)) {
      return res.status(400).json({ message: `Invalid entity: ${widget.entity}` });
    }
    if (!VALID_METRICS.includes(widget.metric)) {
      return res.status(400).json({ message: `Invalid metric: ${widget.metric}` });
    }
    if (!widget.title || typeof widget.title !== "string") {
      return res.status(400).json({ message: "Widget title is required" });
    }
    if (!widget.groupBy || typeof widget.groupBy !== "string") {
      return res.status(400).json({ message: "Widget groupBy is required" });
    }
  }

  const updated = await updateDashboardLayout(userId, tenantId, layout);

  res.json({ layout: updated.layout });
});
