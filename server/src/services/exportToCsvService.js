import emailController from "../modules/emails/controllers/emailController.js";
import leadModel from "../modules/leads/models/leadModel.js";
import dealModel from "../modules/deals/models/dealModel.js";
import organizationModel from "../modules/organizations/models/organizationModel.js";
import { s3Manager } from "./aws/s3Manager.js";
import { EXPORT_COLUMNS, transformDocToRow } from "../utils/exportToCSV.js";
import mongoose from "mongoose";

class ExportCsvEngine {
  constructor() {}

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

    console.log("[ExportLeads] 🚀 Starting export job", {
      tenantId,
      idCount: ids?.length,
      email,
      messageKeys: Object.keys(message),
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

    console.log("[ExportLeads] ✓ Converted IDs:", {
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

    console.log("[ExportLeads] ✓ Query results:", {
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
    console.log("[ExportLeads] ✓ First document fields:", Object.keys(docs[0]));
    console.log(
      "[ExportLeads] ✓ Expected export columns:",
      EXPORT_COLUMNS.leads,
    );

    // Build CSV
    let csv;
    try {
      csv = this.buildCsv(EXPORT_COLUMNS.leads, docs);
    } catch (csvError) {
      console.error("[ExportLeads] CSV generation failed:", csvError);
      throw new Error(`CSV generation failed: ${csvError.message}`);
    }

    const csvLines = csv.split("\n");
    console.log("[ExportLeads] ✓ CSV generated successfully:", {
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

    console.log("[ExportLeads] 📤 Uploading to S3:", { bucket, key });

    let signed;
    try {
      signed = await this.uploadAndGetSigned(bucket, key, csv, fileName);
    } catch (s3Error) {
      console.error("[ExportLeads] S3 upload failed:", s3Error);
      throw new Error(`S3 upload failed: ${s3Error.message}`);
    }

    console.log("[ExportLeads] ✓ S3 upload successful", { key, fileName });
    console.log("[ExportLeads] 📧 Sending email to:", email);

    // Send email
    try {
      await this.sendExportEmail(email, "leads", signed, docs.length);
      console.log("[ExportLeads] ✅ Export job completed successfully");
    } catch (emailError) {
      console.error(
        "[ExportLeads] ❌ Email send failed, but export was created:",
        emailError,
      );
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

    console.log("[ExportDeals] 🚀 Starting export job", {
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

    console.log("[ExportDeals] ✓ Query results:", {
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
      console.log("[ExportDeals] ✅ Export job completed successfully");
    } catch (emailError) {
      console.error("[ExportDeals] ❌ Email send failed:", emailError);
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

    console.log("[ExportOrganizations] 🚀 Starting export job", {
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

    console.log("[ExportOrganizations] ✓ Query results:", {
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
      console.log("[ExportOrganizations] ✅ Export job completed successfully");
    } catch (emailError) {
      console.error("[ExportOrganizations] ❌ Email send failed:", emailError);
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
        <div style="margin:0;padding:0;background-color:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
              <td align="center">
                
                <!-- Card Container -->
                <table width="600" cellpadding="0" cellspacing="0" 
                  style="background:#ffffff;border-radius:12px;overflow:hidden;
                        box-shadow:0 8px 30px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);
                              padding:30px;text-align:center;color:#ffffff;">
                      <h1 style="margin:0;font-size:24px;font-weight:600;">
                        Campaign Flux
                      </h1>
                      <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
                        Data Export Ready
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 30px;">
                      <h2 style="margin-top:0;color:#111827;font-size:20px;">
                        Your Export is Ready
                      </h2>

                      <p style="color:#4b5563;font-size:14px;line-height:1.6;">
                        Your requested <strong>${entityType}</strong> export has been generated successfully.
                        You can download the file using the button below.
                      </p>

                      <!-- Download Button -->
                      <div style="margin:30px 0;text-align:center;">
                        <a href="${signedFile.url}" 
                          style="
                            display:inline-block;
                            background:#6366f1;
                            color:#ffffff;
                            text-decoration:none;
                            padding:14px 28px;
                            font-size:14px;
                            font-weight:600;
                            border-radius:8px;
                            box-shadow:0 4px 14px rgba(99,102,241,0.3);
                          ">
                          Download ${signedFile.fileName}
                        </a>
                      </div>

                      <!-- File Details -->
                      <div style="
                        background:#f9fafb;
                        border:1px solid #e5e7eb;
                        border-radius:10px;
                        padding:16px;
                        font-size:13px;
                        color:#6b7280;
                      ">
                        <p style="margin:0;">
                          <strong>File:</strong> ${signedFile.fileName}
                        </p>
                        <p style="margin:6px 0 0;">
                          <strong>Rows:</strong> ${count}
                        </p>
                      </div>

                      <p style="margin-top:25px;color:#6b7280;font-size:13px;">
                        This download link will expire shortly for security reasons.
                      </p>

                      <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">

                      <p style="color:#9ca3af;font-size:12px;line-height:1.6;">
                        If you did not request this export, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9fafb;padding:20px;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#9ca3af;">
                        © ${new Date().getFullYear()} Campaign Flux. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </div>
        `;

    console.log(`[SendExportEmail] Starting email send`, {
      email,
      entityType,
      subject,
      count,
      fileName: signedFile?.fileName,
    });

    try {
      const result = await emailController.sendEmail({
        to: email,
        subject,
        html,
      });
      console.log(`[SendExportEmail] Email sent successfully`, {
        email,
        entityType,
        messageId: result?.messageId || result?.response,
        timestamp: new Date().toISOString(),
      });
      return result;
    } catch (emailError) {
      console.error(`[SendExportEmail] Email send failed`, {
        email,
        entityType,
        error: emailError.message,
        errorStack: emailError.stack,
        timestamp: new Date().toISOString(),
      });
      throw emailError;
    }
  }
}

export const exportCsvEngine = new ExportCsvEngine();
export default exportCsvEngine;
