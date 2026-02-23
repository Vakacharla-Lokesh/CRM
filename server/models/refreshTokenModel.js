import mongoose from "mongoose";
import crypto from "crypto";

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

refreshTokenSchema.statics.hashToken = function (rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
};

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
