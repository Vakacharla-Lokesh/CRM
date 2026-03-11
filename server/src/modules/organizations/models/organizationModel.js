import { Schema, model } from "mongoose";

// MongoDB collection schema
const organizationsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "organizationId", auto: true },
    tenantId: { type: Schema.Types.ObjectId, required: true, rel: "Tenants" },
    userId: { type: Schema.Types.ObjectId, required: true, rel: "Users" },
    name: { type: String, required: true },
    size: { type: Number, min: 1, max: 10000000 },
    website: {
      type: String,
      match: [
        /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\/-]))?/,
        "Please provide valid website link",
      ],
      required: true,
    },
    industry: {
      type: String,
      enum: ["Software", "Textile", "Foods", "Others"],
      required: true,
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, "City name cannot exceed 100 characters"],
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, "Country name cannot exceed 100 characters"],
    },
  },
  { timestamps: true },
);

// Indexes
organizationsSchema.index({ tenantId: 1 });
organizationsSchema.index({ userId: 1, createdAt: -1 });
organizationsSchema.index(
  { idempotencyKey: 1 },
  { unique: true, sparse: true, name: "idempotency_key_unique" },
);

// search index
organizationsSchema.index({
  name: "text",
  website: "text",
  industry: "text",
  city: "text",
  country: "text",
});

export default model("Organizations", organizationsSchema);
