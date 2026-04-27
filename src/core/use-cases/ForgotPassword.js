import crypto from 'crypto';

export class ForgotPassword {
  constructor(userRepository, mailService) {
    this.userRepository = userRepository;
    this.mailService = mailService;
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

    // Send Email
    await this.mailService.sendPasswordReset(email, resetToken);

    return { message: "If that email exists, a reset link has been sent." };
  }
}