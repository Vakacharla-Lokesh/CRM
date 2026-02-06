import { Schema, model } from "mongoose";

const organizationsSchema = new Schema(
  {
    _id: { type: Schema.Types.UUID, default: () => crypto.randomUUID() },
    tenantId: { type: String, required: true },
    userId: { type: String, required: true },
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

export default model("Organizations", organizationsSchema);
