import nodemailer from "nodemailer";

export class MailService {
  async sendVerificationEmail(email, name, token) {
    if(!process.env.MAIL_USER || process.env.MAIL_USER === "your_user") {
      console.log(`[MOCK EMAIL] to: ${email} | Name: ${name} | Token: ${token}`);
      return true;
    }
  }
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

  async sendVerificationEmail(email, token) {
    const url = `${process.env.BASE_URL}/verify/${token}`;
    return await this.transporter.sendMail({
      from: '"Auth System" <no-reply@auth.com>',
      to: email,
      subject: "Verify Account",
      text: `Click here: ${url}`,
    });
  }

async sendPasswordReset(email, token) {
    try {
      // For testing, we generate the link that will eventually point to your Frontend
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      
      console.log("-----------------------------------------");
      console.log(`📧 Sending Reset Email to: ${email}`);
      console.log(`🔗 Link: ${resetLink}`);
      console.log("-----------------------------------------");

      // Later, you will add your Nodemailer/SendGrid logic here
      return true;
    } catch (error) {
      console.error("MailService Error:", error);
      throw new Error("ERR_EMAIL_SEND_FAILED");
    }
  }
}
