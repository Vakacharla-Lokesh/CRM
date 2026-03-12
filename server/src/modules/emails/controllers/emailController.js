import nodemailer from "nodemailer";
import envConfig from "../../../config/envConfig.js";
import emailTemplates from "../templates/emailTemplates.js";

let _transport = null;

function getTransport() {
  if (_transport) return _transport;

  const MAILTRAP_CREDENTIALS = envConfig.mailtrap;

  const HOST = MAILTRAP_CREDENTIALS.host;
  const PORT = MAILTRAP_CREDENTIALS.port;
  const USER = MAILTRAP_CREDENTIALS.user;
  const PASS = MAILTRAP_CREDENTIALS.pass;

  if (!HOST || !PORT || !USER || !PASS) {
    console.warn("Mailtrap SMTP credentials are missing in .env");
  }

  _transport = nodemailer.createTransport({
    host: HOST,
    port: Number(PORT),
    secure: false,
    auth: { user: USER, pass: PASS },
  });

  return _transport;
}

const FROM_EMAIL = () =>
  envConfig.mailtrap.fromEmail || "hello@demomailtrap.co";
const FROM_NAME = () => envConfig.mailtrap.fromName || "Your App";

const emailController = {
  sendOTPEmail: async (email, otp) => {
    const mailOptions = emailTemplates.otpEmail(email, otp, 5);
    return await getTransport().sendMail(mailOptions);
  },

  sendPasswordResetConfirmation: async (email) => {
    const mailOptions = emailTemplates.passwordResetConfirmation(email);
    return await getTransport().sendMail(mailOptions);
  },

  sendAdminMail: async (tenant, randomPassword) => {
    const mailOptions = emailTemplates.adminMail(tenant, randomPassword);
    return await getTransport().sendMail(mailOptions);
  },

  sendTestEmail: async (email) => {
    return await getTransport().sendMail({
      from: `"${FROM_NAME()}" <${FROM_EMAIL()}>`,
      to: email,
      subject: "Test Email",
      text: "This is a test email.",
    });
  },

  sendEmail: async ({ to, subject, html, text }) => {
    console.log("[EmailController] sendEmail called", {
      to,
      subject,
      htmlLength: html?.length,
      hasText: !!text,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await getTransport().sendMail({
        from: `"${FROM_NAME()}" <${FROM_EMAIL()}>`,
        to,
        subject,
        html,
        text,
      });

      console.log("[EmailController] Email sent successfully", {
        to,
        response: result?.response,
        messageId: result?.messageId,
      });

      return result;
    } catch (error) {
      console.error("[EmailController] sendMail failed", {
        to,
        subject,
        error: error.message,
        errorCode: error.code,
        errorStack: error.stack,
      });
      throw error;
    }
  },

  sendLeadReminderMail: async ({ _id, to, userName, leadName }) => {
    const mailOptions = emailTemplates.sendLeadReminderMail(
      to,
      userName,
      leadName,
      _id,
    );
    return await getTransport().sendMail(mailOptions);
  },
};

export default emailController;
