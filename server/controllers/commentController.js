import commentModel from "../models/commentModel.js";
import leadModel from "../models/leadModel.js";

// Get all comments
export const getAllComments = async (req, res, next) => {
  try {
    const comments = await commentModel.find();

    res.json({
      count: comments.length,
      comments,
    });
  } catch (err) {
    next(err);
  }
};

// Get comment by ID
export const getCommentById = async (req, res, next) => {
  try {
    const comment = await commentModel.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json({ comment });
  } catch (err) {
    next(err);
  }
};

// Create a new comment
export const createComment = async (req, res, next) => {
  try {
    // Verify lead exists and belongs to user's tenant
    const lead = await leadModel.findById(req.body.leadId);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Check tenant access
    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message:
          "Forbidden: You cannot add comments to leads from other tenants",
      });
    }

    const comment = await commentModel.create(req.body);

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (err) {
    next(err);
  }
};

// Update comment
export const updateComment = async (req, res, next) => {
  try {
    const comment = await commentModel.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Verify lead tenant access
    const lead = await leadModel.findById(comment.leadId);
    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot update this comment",
      });
    }

    const updatedComment = await commentModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (err) {
    next(err);
  }
};

// Delete comment
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await commentModel.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Verify lead tenant access
    const lead = await leadModel.findById(comment.leadId);
    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot delete this comment",
      });
    }

    await commentModel.findByIdAndDelete(req.params.id);

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get comments by lead
export const getCommentsByLead = async (req, res, next) => {
  try {
    // Verify lead tenant access
    const lead = await leadModel.findById(req.params.leadId);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot access comments from other tenants",
      });
    }

    const comments = await commentModel.find({ leadId: req.params.leadId });

    res.json({
      count: comments.length,
      comments,
    });
  } catch (err) {
    next(err);
  }
};
