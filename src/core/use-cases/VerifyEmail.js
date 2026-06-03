import crypto from "crypto";

export class VerifyEmail {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(token) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await this.userRepository.findByVerificationToken(hashedToken);

    if (!user) {
      throw new Error("INVALID_OR_EXPIRED_VERIFICATION_TOKEN");
    }

    await this.userRepository.verifyEmail(user._id);

    return { message: "Email verified successfully" };
  }
}
