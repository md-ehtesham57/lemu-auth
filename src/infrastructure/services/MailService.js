import nodemailer from "nodemailer";

export class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(email, name, token) {
    if (!process.env.MAIL_USER || process.env.MAIL_USER === "your_user") {
      console.log(`[MOCK EMAIL] to: ${email} | Name: ${name} | Token: ...${token.slice(-6)}`);
      return true;
    }
    const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;
    return await this.transporter.sendMail({
      from: '"Auth System" <no-reply@auth.com>',
      to: email,
      subject: "Verify Account",
      text: `Hello ${name},\n\nPlease verify your account by clicking: ${url}`,
      html: `<p>Hello ${name},</p><p>Please verify your account by clicking the link below:</p><p><a href="${url}">Verify Account</a></p>`,
    });
  }

  async sendPasswordReset(email, token) {
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    console.log("-----------------------------------------");
    console.log(`Sending Reset Email to: ${email}`);
    console.log(`Link suffix: ...${token.slice(-6)}`);
    console.log("-----------------------------------------");

    if (!process.env.MAIL_USER || process.env.MAIL_USER === "your_user") {
      console.log(`[MOCK EMAIL] Password reset to: ${email} | Token: ...${token.slice(-6)}`);
      return true;
    }

    try {
      return await this.transporter.sendMail({
        from: '"Auth System" <no-reply@auth.com>',
        to: email,
        subject: "Password Reset Request",
        text: `Hello,\n\nPlease reset your password by clicking the link below:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
        html: `<p>Hello,</p><p>Please reset your password by clicking the link below:</p><p><a href="${resetLink}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p>`,
      });
    } catch (error) {
      console.error("MailService Error:", error);
      throw new Error("ERR_EMAIL_SEND_FAILED");
    }
  }
}
