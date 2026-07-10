import nodemailer from "nodemailer";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

function getTransport() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const transport = getTransport();
  if (!transport) {
    console.log(`[email] Skipped sending to ${to}: SMTP not configured`);
    return { success: true, skipped: true };
  }

  const from = process.env.EMAIL_FROM || `"BillForge" <${process.env.SMTP_USER || "noreply@billforge.zenithopensource.com"}>`;

  try {
    await transport.sendMail({ from, to, subject, html });
    return { success: true };
  } catch (err) {
    console.error("[email] Failed to send:", err);
    return { success: false, error: "Failed to send email" };
  }
}

export function verificationHtml(token: string): { subject: string; html: string } {
  const url = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?token=${token}`;
  return {
    subject: "Verify your BillForge email",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Verify your email</h2>
        <p style="color: #475569; line-height: 1.5;">
          Thanks for creating a BillForge account. Click the link below to verify your email address.
        </p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #94a3b8; font-size: 14px;">
          This link expires in 24 hours.
        </p>
      </div>
    `,
  };
}

export function passwordResetHtml(token: string): { subject: string; html: string } {
  const url = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  return {
    subject: "Reset your BillForge password",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Reset your password</h2>
        <p style="color: #475569; line-height: 1.5;">
          Someone requested a password reset for your BillForge account.
          Click the link below to set a new password. This link expires in 1 hour.
        </p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #94a3b8; font-size: 14px;">
          If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
  };
}