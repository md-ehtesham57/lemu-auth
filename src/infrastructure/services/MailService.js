import { Resend } from "resend";

export class MailService {
  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey !== "your_resend_api_key") {
      this.resend = new Resend(apiKey);
    } else {
      this.resend = null;
    }
  }

  async sendVerificationEmail(email, name, token) {
    if (!this.resend) {
      console.log(`[MOCK EMAIL] to: ${email} | Name: ${name} | OTP: ${token}`);
      return true;
    }
    const from = process.env.MAIL_FROM || "onboarding@resend.dev";
    const { error } = await this.resend.emails.send({
      from,
      to: email,
      subject: "Your OTP Code",
      text: `Hello ${name},\n\nYour verification code is: ${token}\n\nEnter this code to verify your account.\n\nThis code expires in 1 hour.`,
      html: `<p>Hello ${name},</p><p>Your verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px;color:#E11D48">${token}</p><p>Enter this code to verify your account.</p><p>This code expires in 1 hour.</p>`,
    });
    if (error) {
      console.error("Resend Error:", error);
      throw new Error("ERR_EMAIL_SEND_FAILED");
    }
    console.log(`Verification email sent to ${email} successfully!`);
  }

  async sendPasswordReset(email, token) {
    if (!this.resend) {
      console.log(`[MOCK EMAIL] Password reset to: ${email} | OTP: ${token}`);
      return true;
    }
    const from = process.env.MAIL_FROM || "onboarding@resend.dev";
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    const { error } = await this.resend.emails.send({
      from,
      to: email,
      subject: "Password Reset Request",
      text: `Hello,\n\nPlease reset your password by clicking the link below:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
      html: `<p>Hello,</p><p>Please reset your password by clicking the link below:</p><p><a href="${resetLink}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p>`,
    });
    if (error) {
      console.error("Resend Error:", error);
      throw new Error("ERR_EMAIL_SEND_FAILED");
    }
  }
}
