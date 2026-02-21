import pool from "../db/initDb.js";
import organizationModel from "../models/organizationModel.js";

// Bulk create leads using batch INSERT
export const bulkCreateLeads = async (req, res, next) => {
  const { leads } = req.body;
  
  if (!Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({ message: "Invalid leads array" });
  }

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    // Build multi-row INSERT statement
    const values = [];
    const placeholders = [];
    let paramCount = 1;
    
    leads.forEach((lead, index) => {
      const {
        firstName,
        lastName,
        email,
        phone,
        company,
        jobTitle,
        source,
        status,
        stage,
        score,
        tenantId,
        assignedUserId,
        organizationId,
      } = lead;
      
      placeholders.push(
        `($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${paramCount + 4}, $${paramCount + 5}, $${paramCount + 6}, $${paramCount + 7}, $${paramCount + 8}, $${paramCount + 9}, $${paramCount + 10}, $${paramCount + 11}, $${paramCount + 12})`
      );
      
      values.push(
        firstName,
        lastName,
        email,
        phone,
        company,
        jobTitle,
        source || "other",
        status || "new",
        stage || "prospect",
        score || 0,
        tenantId || req.user.tenantId,
        assignedUserId,
        organizationId,
      );
      
      paramCount += 13;
    });

    const result = await client.query(
      `INSERT INTO leads (
        first_name, last_name, email, phone, company, job_title,
        source, status, stage, score, tenant_id, assigned_user_id, organization_id
      ) VALUES ${placeholders.join(", ")}
      RETURNING *`,
      values,
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: `Bulk create completed: ${result.rows.length} succeeded`,
      created: result.rows.length,
      failed: 0,
      leads: result.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

// Bulk update leads
export const bulkUpdateLeads = async (req, res, next) => {
  const { updates } = req.body;
  
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "Invalid updates array" });
  }

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const updatedLeads = [];
    const errors = [];
    
    for (let i = 0; i < updates.length; i++) {
      try {
        const { id, ...updateData } = updates[i];
        
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(updateData).forEach(([key, value]) => {
          const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
          fields.push(`${snakeKey} = $${paramCount}`);
          values.push(value);
          paramCount++;
        });

        fields.push("updated_at = NOW()");
        values.push(id);

        const result = await client.query(
          `UPDATE leads SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
          values,
        );

        if (result.rows[0]) {
          updatedLeads.push(result.rows[0]);
        }
      } catch (error) {
        errors.push({ index: i, error: error.message, update: updates[i] });
      }
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: `Bulk update completed: ${updatedLeads.length} succeeded, ${errors.length} failed`,
      updated: updatedLeads.length,
      failed: errors.length,
      leads: updatedLeads,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

// Bulk create deals using batch INSERT
export const bulkCreateDeals = async (req, res, next) => {
  const { deals } = req.body;
  
  if (!Array.isArray(deals) || deals.length === 0) {
    return res.status(400).json({ message: "Invalid deals array" });
  }

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    // Build multi-row INSERT statement
    const values = [];
    const placeholders = [];
    let paramCount = 1;
    
    deals.forEach((deal) => {
      const {
        name,
        value,
        stage,
        status,
        probability,
        expectedCloseDate,
        tenantId,
        leadId,
        assignedUserId,
        organizationId,
      } = deal;
      
      placeholders.push(
        `($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${paramCount + 4}, $${paramCount + 5}, $${paramCount + 6}, $${paramCount + 7}, $${paramCount + 8}, $${paramCount + 9})`
      );
      
      values.push(
        name,
        value,
        stage || "qualification",
        status || "open",
        probability || 0,
        expectedCloseDate,
        tenantId || req.user.tenantId,
        leadId,
        assignedUserId,
        organizationId,
      );
      
      paramCount += 10;
    });

    const result = await client.query(
      `INSERT INTO deals (
        name, value, stage, status, probability, expected_close_date,
        tenant_id, lead_id, assigned_user_id, organization_id
      ) VALUES ${placeholders.join(", ")}
      RETURNING *`,
      values,
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: `Bulk create completed: ${result.rows.length} succeeded`,
      created: result.rows.length,
      failed: 0,
      deals: result.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

// Bulk update deals
export const bulkUpdateDeals = async (req, res, next) => {
  const { updates } = req.body;
  
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "Invalid updates array" });
  }

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const updatedDeals = [];
    const errors = [];
    
    for (let i = 0; i < updates.length; i++) {
      try {
        const { id, ...updateData } = updates[i];
        
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(updateData).forEach(([key, value]) => {
          const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
          fields.push(`${snakeKey} = $${paramCount}`);
          values.push(value);
          paramCount++;
        });

        fields.push("updated_at = NOW()");
        values.push(id);

        const result = await client.query(
          `UPDATE deals SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
          values,
        );

        if (result.rows[0]) {
          updatedDeals.push(result.rows[0]);
        }
      } catch (error) {
        errors.push({ index: i, error: error.message, update: updates[i] });
      }
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: `Bulk update completed: ${updatedDeals.length} succeeded, ${errors.length} failed`,
      updated: updatedDeals.length,
      failed: errors.length,
      deals: updatedDeals,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

// Bulk create comments using batch INSERT
export const bulkCreateComments = async (req, res, next) => {
  const { comments } = req.body;
  
  if (!Array.isArray(comments) || comments.length === 0) {
    return res.status(400).json({ message: "Invalid comments array" });
  }

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    // Build multi-row INSERT statement
    const values = [];
    const placeholders = [];
    let paramCount = 1;
    
    comments.forEach((comment) => {
      const { content, userId, entityType, entityId, parentCommentId } = comment;
      
      placeholders.push(
        `($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${paramCount + 4})`
      );
      
      values.push(
        content,
        userId,
        entityType,
        entityId,
        parentCommentId || null,
      );
      
      paramCount += 5;
    });

    const result = await client.query(
      `INSERT INTO comments (content, user_id, entity_type, entity_id, parent_comment_id)
      VALUES ${placeholders.join(", ")}
      RETURNING *`,
      values,
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: `Bulk create completed: ${result.rows.length} succeeded`,
      created: result.rows.length,
      failed: 0,
      comments: result.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

// Bulk create calls using batch INSERT
export const bulkCreateCalls = async (req, res, next) => {
  const { calls } = req.body;
  
  if (!Array.isArray(calls) || calls.length === 0) {
    return res.status(400).json({ message: "Invalid calls array" });
  }

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    // Build multi-row INSERT statement
    const values = [];
    const placeholders = [];
    let paramCount = 1;
    
    calls.forEach((call) => {
      const {
        direction,
        duration,
        notes,
        outcome,
        scheduledAt,
        userId,
        leadId,
        dealId,
      } = call;
      
      placeholders.push(
        `($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${paramCount + 4}, $${paramCount + 5}, $${paramCount + 6}, $${paramCount + 7})`
      );
      
      values.push(
        direction,
        duration,
        notes,
        outcome,
        scheduledAt,
        userId,
        leadId,
        dealId,
      );
      
      paramCount += 8;
    });

    const result = await client.query(
      `INSERT INTO calls (direction, duration, notes, outcome, scheduled_at, user_id, lead_id, deal_id)
      VALUES ${placeholders.join(", ")}
      RETURNING *`,
      values,
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: `Bulk create completed: ${result.rows.length} succeeded`,
      created: result.rows.length,
      failed: 0,
      calls: result.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

// Bulk create organizations using MongoDB insertMany
export const bulkCreateOrganizations = async (req, res, next) => {
  const { organizations } = req.body;
  
  if (!Array.isArray(organizations) || organizations.length === 0) {
    return res.status(400).json({ message: "Invalid organizations array" });
  }

  try {
    // Prepare organization data with proper tenant and user IDs
    const organizationData = organizations.map((org) => ({
      ...org,
      userId: org.userId || req.user.userId,
      tenantId: org.tenantId || req.user.tenantId,
    }));

    // Use MongoDB's insertMany for batch insert
    const createdOrganizations = await organizationModel.insertMany(
      organizationData,
      { ordered: false }, // Continue on error
    );

    res.status(201).json({
      message: `Bulk create completed: ${createdOrganizations.length} succeeded`,
      created: createdOrganizations.length,
      failed: 0,
      organizations: createdOrganizations,
    });
  } catch (error) {
    // Handle partial success in MongoDB
    if (error.name === "MongoBulkWriteError" && error.insertedDocs) {
      return res.status(207).json({
        message: `Bulk create partially completed: ${error.insertedDocs.length} succeeded, ${organizations.length - error.insertedDocs.length} failed`,
        created: error.insertedDocs.length,
        failed: organizations.length - error.insertedDocs.length,
        organizations: error.insertedDocs,
        errors: error.writeErrors?.map((e) => ({
          index: e.index,
          error: e.errmsg,
        })),
      });
    }
    next(error);
  }
};

// Bulk update organizations using MongoDB bulkWrite
export const bulkUpdateOrganizations = async (req, res, next) => {
  const { updates } = req.body;
  
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "Invalid updates array" });
  }

  try {
    // Prepare bulk write operations
    const bulkOps = updates.map((update) => {
      const { id, ...updateData } = update;
      return {
        updateOne: {
          filter: { _id: id },
          update: { $set: updateData },
        },
      };
    });

    // Execute bulk write
    const result = await organizationModel.bulkWrite(bulkOps, {
      ordered: false, // Continue on error
    });

    res.status(200).json({
      message: `Bulk update completed: ${result.modifiedCount} succeeded`,
      updated: result.modifiedCount,
      matched: result.matchedCount,
      failed: updates.length - result.matchedCount,
    });
  } catch (error) {
    next(error);
  }
};
