import { Schema, model } from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const otpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expireAfterSeconds: 300 },
    },
  },
  { timestamps: false },
);

otpSchema.statics.generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

otpSchema.statics.hashOTP = async function (otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

otpSchema.methods.verifyOTP = async function (otp) {
  return bcrypt.compare(otp, this.otpHash);
};

otpSchema.index({ email: 1, verified: 1 });

const OTP = model("OTP", otpSchema);
export default OTP;
