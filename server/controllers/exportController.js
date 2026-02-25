import { asyncCatch } from "../utils/asyncCatch.js";
import AppError from "../utils/AppError.js";
import exportService, { EXPORT_COLUMNS } from "../utils/exportToCSV.js";
import { format } from "fast-csv";

function createExportHandler(entityType, filename) {
  return asyncCatch(async (req, res) => {
    try {
      const { ids } = req.body;

      const columns = EXPORT_COLUMNS[entityType];
      if (!columns) {
        throw new AppError("Invalid entity type", 400);
      }

      const filter = ids?.length
        ? { ...req.tenantFilter, _id: { $in: ids } }
        : req.tenantFilter || {};

      const timestamp = new Date().toISOString().slice(0, 10);
      const filenameSafe = `${filename}_${timestamp}.csv`;

      res.setHeader("Content-Type", "text/csv;charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filenameSafe}"`,
      );

      const cursor = await exportService.getExportCursor(entityType, filter);

      const csvStream = format({ headers: columns });

      let rowCount = 0;
      cursor.on("data", (doc) => {
        const row = exportService.transformDocToRow(doc, columns);
        csvStream.write(row);
        rowCount++;
      });

      cursor.on("end", () => {
        csvStream.end();
      });

      cursor.on("error", (err) => {
        console.error("Cursor error:", err);
        csvStream.destroy();
        if (!res.headersSent) {
          res.status(500).json({ message: "Error during export" });
        }
      });

      csvStream.on("error", (err) => {
        console.error("CSV stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error during export" });
        }
      });

      csvStream.pipe(res);
    } catch (error) {
      throw error;
    }
  });
}

export const exportLeads = createExportHandler("leads", "leads");
export const exportOrganizations = createExportHandler(
  "organizations",
  "organizations",
);
export const exportDeals = createExportHandler("deals", "deals");

export default {
  exportLeads,
  exportOrganizations,
  exportDeals,
};
