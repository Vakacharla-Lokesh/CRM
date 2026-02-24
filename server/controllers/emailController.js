import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

const HOST = process.env.MAILTRAP_HOST;
const PORT = process.env.MAILTRAP_PORT;
const USER = process.env.MAILTRAP_USER;
const PASS = process.env.MAILTRAP_PASS;

const FROM_EMAIL =
  process.env.MAILTRAP_FROM_EMAIL || "hello@demomailtrap.co";
const FROM_NAME =
  process.env.MAILTRAP_FROM_NAME || "Your App";

if (!HOST || !PORT || !USER || !PASS) {
  console.warn("Mailtrap SMTP credentials are missing in .env");
}

const transport = nodemailer.createTransport({
  host: HOST,
  port: Number(PORT),
  secure: false,
  auth: {
    user: USER,
    pass: PASS,
  },
});

const emailTemplates = {
  otpEmail: (email, otp, expiryMinutes = 5) => ({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: "Your Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Use the OTP below to proceed.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333; margin: 0;">
            ${otp}
          </p>
        </div>
        <p style="color: #666;">This OTP will expire in ${expiryMinutes} minutes.</p>
      </div>
    `,
    text: `Your password reset OTP is: ${otp}. It expires in ${expiryMinutes} minutes.`,
  }),

  passwordResetConfirmation: (email) => ({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: "Password Reset Successful",
    text: "Your password has been successfully reset.",
    html: `<p>Your password has been successfully reset.</p>`,
  }),
};

const emailController = {
  sendOTPEmail: async (email, otp) => {
    const mailOptions = emailTemplates.otpEmail(email, otp, 5);
    return await transport.sendMail(mailOptions);
  },

  sendPasswordResetConfirmation: async (email) => {
    const mailOptions =
      emailTemplates.passwordResetConfirmation(email);
    return await transport.sendMail(mailOptions);
  },

  sendTestEmail: async (email) => {
    return await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: "Test Email",
      text: "This is a test email.",
    });
  },
};

export default emailController;