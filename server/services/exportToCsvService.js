import emailController from "../controllers/emailController.js";
import leadModel from "../models/leadModel.js";
import dealModel from "../models/dealModel.js";
import organizationModel from "../models/organizationModel.js";
import { s3Manager } from "./aws/s3Manager.js";
import { EXPORT_COLUMNS, transformDocToRow } from "../utils/exportToCSV.js";
import mongoose from "mongoose";

class ExportCsvEngine {
  constructor() {}

  // Build CSV from docs and columns (minimal, safe escaping)
  buildCsv(columns, docs) {
    const header = columns.join(",") + "\n";

    const rows = docs.map((doc) => {
      const rowObj = transformDocToRow(doc, columns);
      return columns
        .map((c) => {
          let val = rowObj[c];
          if (val === null || val === undefined) return "";
          if (typeof val === "object") val = JSON.stringify(val);
          const s = String(val);
          const escaped = s.replace(/"/g, '""');
          if (/[",\n]/.test(escaped)) return `"${escaped}"`;
          return escaped;
        })
        .join(",");
    });

    return header + rows.join("\n") + (rows.length ? "\n" : "");
  }

  async uploadAndGetSigned(bucket, key, content, fileName) {
    await s3Manager.uploadString(bucket, key, content, "text/csv");
    const signed = await s3Manager.downloadFile(bucket, key, fileName);
    return signed;
  }

  async exportLeads(message) {
    const { tenantId, ids, email } = message;

    console.log("[ExportLeads] Processing export request:", {
      tenantId,
      idCount: ids?.length,
      email,
    });

    if (!email) throw new Error("Recipient email is required for export");
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("No lead IDs provided for export");
    }

    // Convert all IDs to ObjectId format
    let objectIds;
    try {
      objectIds = ids.map((id) => {
        if (typeof id === "object" && id._id) {
          // Already an ObjectId object
          return id._id;
        }
        if (mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id);
        }
        console.warn("[ExportLeads] Invalid ObjectId format:", id);
        return id;
      });
    } catch (error) {
      console.error("[ExportLeads] Error converting IDs:", error);
      throw new Error(`Invalid lead IDs provided: ${error.message}`);
    }

    console.log("[ExportLeads] Converted IDs:", {
      count: objectIds.length,
      sample: objectIds[0]?.toString(),
    });

    // Query database
    const filter = { _id: { $in: objectIds } };
    console.log("[ExportLeads] Executing query with filter:", filter);

    let docs;
    try {
      docs = await leadModel.find(filter).lean();
    } catch (dbError) {
      console.error("[ExportLeads] Database query failed:", dbError);
      throw new Error(`Database query failed: ${dbError.message}`);
    }

    console.log("[ExportLeads] Query results:", {
      found: docs.length,
      requested: objectIds.length,
      missing: objectIds.length - docs.length,
    });

    // Validate we got documents
    if (docs.length === 0) {
      console.error("[ExportLeads] NO DOCUMENTS FOUND!", {
        query: JSON.stringify(filter, null, 2),
        requestedIds: objectIds.map((id) => id?.toString()),
      });
      throw new Error(
        `No leads found. Requested ${objectIds.length} IDs but found 0 documents in database.`,
      );
    }

    // Verify structure
    console.log("[ExportLeads] First document fields:", Object.keys(docs[0]));
    console.log("[ExportLeads] Expected export columns:", EXPORT_COLUMNS.leads);

    // Build CSV
    let csv;
    try {
      csv = this.buildCsv(EXPORT_COLUMNS.leads, docs);
    } catch (csvError) {
      console.error("[ExportLeads] CSV generation failed:", csvError);
      throw new Error(`CSV generation failed: ${csvError.message}`);
    }

    const csvLines = csv.split("\n");
    console.log("[ExportLeads] CSV generated successfully:", {
      lines: csvLines.length,
      headerLine: csvLines[0],
      size: `${csv.length} bytes`,
      hasData: csvLines.length > 1,
    });

    // Upload to S3
    const bucket = s3Manager.getBucket();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const key = `exports/${tenantId || "global"}/${timestamp}-leads.csv`;
    const fileName = `leads-${timestamp}.csv`;

    console.log("[ExportLeads] Uploading to S3:", { bucket, key });

    let signed;
    try {
      signed = await this.uploadAndGetSigned(bucket, key, csv, fileName);
    } catch (s3Error) {
      console.error("[ExportLeads] S3 upload failed:", s3Error);
      throw new Error(`S3 upload failed: ${s3Error.message}`);
    }

    console.log("[ExportLeads] S3 upload successful, sending email:", email);

    // Send email
    try {
      await this.sendExportEmail(email, "leads", signed, docs.length);
    } catch (emailError) {
      console.error("[ExportLeads] Email send failed:", emailError);
      // Don't throw - export succeeded, just email failed
    }

    return {
      success: true,
      entity: "leads",
      count: docs.length,
      url: signed.url,
    };
  }

  async exportDeals(message) {
    const { tenantId, ids, email } = message;

    console.log("[ExportDeals] Processing export request:", {
      tenantId,
      idCount: ids?.length,
      email,
    });

    if (!email) throw new Error("Recipient email is required for export");
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("No deal IDs provided for export");
    }

    // Convert all IDs to ObjectId format
    let objectIds;
    try {
      objectIds = ids.map((id) => {
        if (typeof id === "object" && id._id) {
          return id._id;
        }
        if (mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id);
        }
        console.warn("[ExportDeals] Invalid ObjectId format:", id);
        return id;
      });
    } catch (error) {
      console.error("[ExportDeals] Error converting IDs:", error);
      throw new Error(`Invalid deal IDs provided: ${error.message}`);
    }

    const filter = { _id: { $in: objectIds } };
    let docs;
    try {
      docs = await dealModel.find(filter).lean();
    } catch (dbError) {
      console.error("[ExportDeals] Database query failed:", dbError);
      throw new Error(`Database query failed: ${dbError.message}`);
    }

    console.log("[ExportDeals] Query results:", {
      found: docs.length,
      requested: objectIds.length,
    });

    if (docs.length === 0) {
      throw new Error(
        `No deals found. Requested ${objectIds.length} IDs but found 0 documents.`,
      );
    }

    const bucket = s3Manager.getBucket();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    let csv;
    try {
      csv = this.buildCsv(EXPORT_COLUMNS.deals, docs);
    } catch (csvError) {
      console.error("[ExportDeals] CSV generation failed:", csvError);
      throw new Error(`CSV generation failed: ${csvError.message}`);
    }

    const key = `exports/${tenantId || "global"}/${timestamp}-deals.csv`;
    const fileName = `deals-${timestamp}.csv`;

    let signed;
    try {
      signed = await this.uploadAndGetSigned(bucket, key, csv, fileName);
    } catch (s3Error) {
      console.error("[ExportDeals] S3 upload failed:", s3Error);
      throw new Error(`S3 upload failed: ${s3Error.message}`);
    }

    try {
      await this.sendExportEmail(email, "deals", signed, docs.length);
    } catch (emailError) {
      console.error("[ExportDeals] Email send failed:", emailError);
    }

    return {
      success: true,
      entity: "deals",
      count: docs.length,
      url: signed.url,
    };
  }

  async exportOrganizations(message) {
    const { tenantId, ids, email } = message;

    console.log("[ExportOrganizations] Processing export request:", {
      tenantId,
      idCount: ids?.length,
      email,
    });

    if (!email) throw new Error("Recipient email is required for export");
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("No organization IDs provided for export");
    }

    // Convert all IDs to ObjectId format
    let objectIds;
    try {
      objectIds = ids.map((id) => {
        if (typeof id === "object" && id._id) {
          return id._id;
        }
        if (mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id);
        }
        console.warn("[ExportOrganizations] Invalid ObjectId format:", id);
        return id;
      });
    } catch (error) {
      console.error("[ExportOrganizations] Error converting IDs:", error);
      throw new Error(`Invalid organization IDs provided: ${error.message}`);
    }

    const filter = { _id: { $in: objectIds } };
    let docs;
    try {
      docs = await organizationModel.find(filter).lean();
    } catch (dbError) {
      console.error("[ExportOrganizations] Database query failed:", dbError);
      throw new Error(`Database query failed: ${dbError.message}`);
    }

    console.log("[ExportOrganizations] Query results:", {
      found: docs.length,
      requested: objectIds.length,
    });

    if (docs.length === 0) {
      throw new Error(
        `No organizations found. Requested ${objectIds.length} IDs but found 0 documents.`,
      );
    }

    const bucket = s3Manager.getBucket();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    let csv;
    try {
      csv = this.buildCsv(EXPORT_COLUMNS.organizations, docs);
    } catch (csvError) {
      console.error("[ExportOrganizations] CSV generation failed:", csvError);
      throw new Error(`CSV generation failed: ${csvError.message}`);
    }

    const key = `exports/${tenantId || "global"}/${timestamp}-organizations.csv`;
    const fileName = `organizations-${timestamp}.csv`;

    let signed;
    try {
      signed = await this.uploadAndGetSigned(bucket, key, csv, fileName);
    } catch (s3Error) {
      console.error("[ExportOrganizations] S3 upload failed:", s3Error);
      throw new Error(`S3 upload failed: ${s3Error.message}`);
    }

    try {
      await this.sendExportEmail(email, "organizations", signed, docs.length);
    } catch (emailError) {
      console.error("[ExportOrganizations] Email send failed:", emailError);
    }

    return {
      success: true,
      entity: "organizations",
      count: docs.length,
      url: signed.url,
    };
  }

  async sendExportEmail(email, entityType, signedFile, count) {
    const subject = `Your ${entityType} export is ready`;
    const html = `
      <p>Your requested ${entityType} export is ready.</p>
      <p><a href="${signedFile.url}">${signedFile.fileName}</a> (${count} rows)</p>
      <p>This link will expire shortly.</p>
    `;

    await emailController.sendEmail({ to: email, subject, html });
  }
}

export const exportCsvEngine = new ExportCsvEngine();
export default exportCsvEngine;
