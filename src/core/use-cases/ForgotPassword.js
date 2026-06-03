import crypto from 'crypto';
import { addMailJob } from "../../infrastructure/queues/mail.queue.js";

export class ForgotPassword {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(email) {
    const user = await this.userRepository.findByEmail(email);
    
    // Security: Always return a success-style message 
    // even if the user doesn't exist to prevent email harvesting.
    if (!user) return { message: "If that email exists, a reset link has been sent." };

    // Generate Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save to DB (Expires in 1 hour)
    await this.userRepository.updateResetToken(user._id, hashedToken, Date.now() + 3600000);

    // Send Email via Queue
    try {
      await addMailJob({
        type: "password-reset",
        email: user.email,
        token: resetToken
      });
    } catch (error) {
      console.error("Failed to queue password reset email:", error.message);
    }

    return { message: "If that email exists, a reset link has been sent." };
  }
}
