import nodemailer from "nodemailer";

let _transport = null;

function getTransport() {
  if (_transport) return _transport;

  const HOST = process.env.MAILTRAP_HOST;
  const PORT = process.env.MAILTRAP_PORT;
  const USER = process.env.MAILTRAP_USER;
  const PASS = process.env.MAILTRAP_PASS;

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
  process.env.MAILTRAP_FROM_EMAIL || "hello@demomailtrap.co";
const FROM_NAME = () => process.env.MAILTRAP_FROM_NAME || "Your App";

const emailTemplates = {
  otpEmail: (email, otp, expiryMinutes = 5) => ({
    from: `"${FROM_NAME()}" <${FROM_EMAIL()}>`,
    to: email,
    subject: "Your Password Reset OTP",
    html: `
      <div style="margin:0;padding:0;background-color:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">
              
              <!-- Card Container -->
              <table width="600" cellpadding="0" cellspacing="0" 
                style="background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 8px 30px rgba(0,0,0,0.08);">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);
                            padding:30px;text-align:center;color:#ffffff;">
                    <h1 style="margin:0;font-size:24px;font-weight:600;">
                      Campaign Flux
                    </h1>
                    <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
                      Secure Password Reset
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 30px;">
                    <h2 style="margin-top:0;color:#111827;font-size:20px;">
                      Password Reset Request
                    </h2>

                    <p style="color:#4b5563;font-size:14px;line-height:1.6;">
                      We received a request to reset your password for your 
                      <strong>Campaign Flux</strong> account.
                      Use the OTP below to continue.
                    </p>

                    <!-- OTP Box -->
                    <div style="margin:30px 0;text-align:center;">
                      <div style="
                        display:inline-block;
                        padding:18px 32px;
                        font-size:32px;
                        font-weight:700;
                        letter-spacing:6px;
                        background:#eef2ff;
                        color:#4f46e5;
                        border-radius:10px;
                        border:1px solid #c7d2fe;
                      ">
                        ${otp}
                      </div>
                    </div>

                    <p style="color:#6b7280;font-size:13px;text-align:center;">
                      This OTP will expire in 
                      <strong>${expiryMinutes} minutes</strong>.
                    </p>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">

                    <p style="color:#9ca3af;font-size:12px;line-height:1.6;">
                      If you did not request a password reset, you can safely ignore this email.
                      Your account remains secure.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;padding:20px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;">
                      © ${new Date().getFullYear()} Campaign Flux. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
    text: `Your password reset OTP is: ${otp}. It expires in ${expiryMinutes} minutes.`,
  }),

  passwordResetConfirmation: (email) => ({
    from: `"${FROM_NAME()}" <${FROM_EMAIL()}>`,
    to: email,
    subject: "Password Reset Successful",
    text: "Your password has been successfully reset.",
    html: `
      <div style="margin:0;padding:0;background-color:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">

              <!-- Card Container -->
              <table width="600" cellpadding="0" cellspacing="0" 
                style="background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 8px 30px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);
                            padding:30px;text-align:center;color:#ffffff;">
                    <h1 style="margin:0;font-size:24px;font-weight:600;">
                      Campaign Flux
                    </h1>
                    <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
                      Password Reset Confirmation
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 30px;">
                    <h2 style="margin-top:0;color:#111827;font-size:20px;">
                      Your password has been successfully reset!
                    </h2>

                    <p style="color:#4b5563;font-size:14px;line-height:1.6;">
                      Your account password for <strong>Campaign Flux</strong> has been updated.
                      You can now log in with your new password.
                    </p>

                    <div style="margin:30px 0;text-align:center;">
                      <a href="https://your-app-login-url.com" 
                        style="
                          display:inline-block;
                          padding:12px 24px;
                          background:#6366f1;
                          color:#ffffff;
                          text-decoration:none;
                          border-radius:8px;
                          font-weight:600;
                        ">
                        Login Now
                      </a>
                    </div>

                    <p style="color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                      If you did not perform this action, please contact support immediately.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;padding:20px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;">
                      © ${new Date().getFullYear()} Campaign Flux. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </div>
      `,
  }),

  adminMail: (tenant, randomPassword) => ({
    from: `"${FROM_NAME()}" <${FROM_EMAIL()}>`,
    to: tenant.email,
    subject: "Your Admin Account Credentials have been created",
    html: `
      <div style="margin:0;padding:0;background-color:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" 
                style="background:#ffffff;border-radius:12px;overflow:hidden;
                       box-shadow:0 8px 30px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);
                             padding:30px;text-align:center;color:#ffffff;">
                    <h1 style="margin:0;font-size:24px;font-weight:600;">
                      Campaign Flux
                    </h1>
                    <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
                      Admin Account Credentials
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 30px;">
                    <h2 style="margin-top:0;color:#111827;font-size:20px;">
                      Welcome to Campaign Flux!
                    </h2>
                    <p style="color:#4b5563;font-size:14px;line-height:1.6;">
                      Your tenant has been created. Here are your admin credentials:
                    </p>
                    <div style="margin:20px 0;padding:20px;background:#eef2ff;border-radius:10px;text-align:center;">
                      <p><strong>Email:</strong> ${tenant.email}</p>
                      <p><strong>Password:</strong> ${randomPassword}</p>
                    </div>
                    <p style="color:#6b7280;font-size:13px;text-align:center;">
                      Please change your password after logging in.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;padding:20px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;">
                      © ${new Date().getFullYear()} Campaign Flux. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
  }),

  sendLeadReminderMail: (to, userName, leadName, leadId) => ({
    from: `"${FROM_NAME()}" <${FROM_EMAIL()}>`,
    to,
    subject: "Your lead is getting stale.",
    html: `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background:#111827;padding:24px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:600;">
                    Lead Reminder
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">
                    Hi ${userName},
                  </p>

                  <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.6;">
                    Just a quick reminder that your lead 
                    <strong>${leadName}</strong> hasn’t been updated in the last 14 days.
                  </p>

                  <p style="margin:0 0 24px 0;font-size:15px;color:#374151;line-height:1.6;">
                    Following up promptly can significantly improve your chances of conversion.
                    Consider reaching out to keep the momentum going.
                  </p>

                  <!-- Button -->
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="border-radius:6px;background-color:#2563eb;">
                        <a href=/leads/${leadId} 
                           style="display:inline-block;padding:12px 20px;font-size:14px;color:#ffffff;text-decoration:none;font-weight:600;">
                          View Lead
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:24px;background:#f9fafb;text-align:center;font-size:12px;color:#6b7280;">
                  You’re receiving this reminder because the lead is still marked as "New".
                  <br/><br/>
                  © ${new Date().getFullYear()} ${FROM_NAME()}
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `,
  }),
};

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
    console.log("[EmailController] 📧 sendEmail called", {
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

      console.log("[EmailController] ✓ Email sent successfully", {
        to,
        response: result?.response,
        messageId: result?.messageId,
      });

      return result;
    } catch (error) {
      console.error("[EmailController] ❌ sendMail failed", {
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
