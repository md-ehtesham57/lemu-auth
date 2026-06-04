import crypto from "crypto";

export class ResetPassword {
  constructor(userRepository, passwordService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute(token, password) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await this.userRepository.findByResetToken(hashedToken);

    if (!user) {
      throw new Error("INVALID_OR_EXPIRED_RESET_TOKEN");
    }

    if (user.passwordResetExpires && user.passwordResetExpires < Date.now()) {
      throw new Error("INVALID_OR_EXPIRED_RESET_TOKEN");
    }

    const hashedPassword = await this.passwordService.hash(password);

    await this.userRepository.resetPassword(user._id, hashedPassword);

    return { message: "Password reset successful" };
  }
}
