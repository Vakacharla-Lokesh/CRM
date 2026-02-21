import pool from "../db/initDb.js";

// Bulk create leads
export const bulkCreateLeads = async (req, res, next) => {
  const { leads } = req.body;
  
  if (!Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({ message: "Invalid leads array" });
  }

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const createdLeads = [];
    const errors = [];
    
    for (let i = 0; i < leads.length; i++) {
      try {
        const lead = leads[i];
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

        const result = await client.query(
          `INSERT INTO leads (
            first_name, last_name, email, phone, company, job_title,
            source, status, stage, score, tenant_id, assigned_user_id, organization_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *`,
          [
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
          ],
        );

        createdLeads.push(result.rows[0]);
      } catch (error) {
        errors.push({ index: i, error: error.message, lead: leads[i] });
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: `Bulk create completed: ${createdLeads.length} succeeded, ${errors.length} failed`,
      created: createdLeads.length,
      failed: errors.length,
      leads: createdLeads,
      errors: errors.length > 0 ? errors : undefined,
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

// Bulk create deals
export const bulkCreateDeals = async (req, res, next) => {
  const { deals } = req.body;
  
  if (!Array.isArray(deals) || deals.length === 0) {
    return res.status(400).json({ message: "Invalid deals array" });
  }

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const createdDeals = [];
    const errors = [];
    
    for (let i = 0; i < deals.length; i++) {
      try {
        const deal = deals[i];
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

        const result = await client.query(
          `INSERT INTO deals (
            name, value, stage, status, probability, expected_close_date,
            tenant_id, lead_id, assigned_user_id, organization_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *`,
          [
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
          ],
        );

        createdDeals.push(result.rows[0]);
      } catch (error) {
        errors.push({ index: i, error: error.message, deal: deals[i] });
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: `Bulk create completed: ${createdDeals.length} succeeded, ${errors.length} failed`,
      created: createdDeals.length,
      failed: errors.length,
      deals: createdDeals,
      errors: errors.length > 0 ? errors : undefined,
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

// Bulk create comments
export const bulkCreateComments = async (req, res, next) => {
  const { comments } = req.body;
  
  if (!Array.isArray(comments) || comments.length === 0) {
    return res.status(400).json({ message: "Invalid comments array" });
  }

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const createdComments = [];
    const errors = [];
    
    for (let i = 0; i < comments.length; i++) {
      try {
        const comment = comments[i];
        const { content, userId, entityType, entityId, parentCommentId } = comment;

        const result = await client.query(
          `INSERT INTO comments (content, user_id, entity_type, entity_id, parent_comment_id)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *`,
          [content, userId, entityType, entityId, parentCommentId || null],
        );

        createdComments.push(result.rows[0]);
      } catch (error) {
        errors.push({ index: i, error: error.message, comment: comments[i] });
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: `Bulk create completed: ${createdComments.length} succeeded, ${errors.length} failed`,
      created: createdComments.length,
      failed: errors.length,
      comments: createdComments,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

// Bulk create calls
export const bulkCreateCalls = async (req, res, next) => {
  const { calls } = req.body;
  
  if (!Array.isArray(calls) || calls.length === 0) {
    return res.status(400).json({ message: "Invalid calls array" });
  }

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const createdCalls = [];
    const errors = [];
    
    for (let i = 0; i < calls.length; i++) {
      try {
        const call = calls[i];
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

        const result = await client.query(
          `INSERT INTO calls (direction, duration, notes, outcome, scheduled_at, user_id, lead_id, deal_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
          [direction, duration, notes, outcome, scheduledAt, userId, leadId, dealId],
        );

        createdCalls.push(result.rows[0]);
      } catch (error) {
        errors.push({ index: i, error: error.message, call: calls[i] });
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: `Bulk create completed: ${createdCalls.length} succeeded, ${errors.length} failed`,
      created: createdCalls.length,
      failed: errors.length,
      calls: createdCalls,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};
