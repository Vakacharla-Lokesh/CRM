import { Schema, model } from "mongoose";

// MongoDB collection schema
const organizationsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, alias: "organizationId", auto: true },
    tenantId: { type: Schema.Types.ObjectId, required: true, rel: "Tenants" },
    userId: { type: Schema.Types.ObjectId, required: true, rel: "Users" },
    organizationName: { type: String, required: true },
    organizationSize: { type: Number, min: 1, max: 10000000 },
    organizationWebsite: {
      type: String,
      match: [
        /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\/-]))?/,
        "Please provide valid website link",
      ],
      required: true,
    },
    organizationIndustry: {
      type: String,
      enum: ["Software", "Textile", "Foods", "Others"],
      required: true,
    },
  },
  { timestamps: true },
);

// Indexes
organizationsSchema.index({ tenantId: 1 });
organizationsSchema.index({ userId: 1, createdAt: -1 });


export default model("Organizations", organizationsSchema);
