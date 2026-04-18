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
}
