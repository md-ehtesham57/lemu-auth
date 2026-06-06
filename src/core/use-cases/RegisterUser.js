import crypto from "crypto";
import { addMailJob } from "../../infrastructure/queues/mail.queue.js";

export class RegisterUser {
  constructor(userRepository, passwordService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute(userData) {
    const { name, email, password } = userData;

    // Check existence BEFORE hashing to save expensive CPU cycles.
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("USER_ALREADY_EXISTS");
    }

    // Hashing is CPU-bound; crypto is fast.
    const hashedPassword = await this.passwordService.hash(password);
    const verificationToken = String(crypto.randomInt(100000, 999999));
    const hashedVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    // Ensure your Repository/Model has a unique index on 'email' as a final safety net.
    const newUser = await this.userRepository.save({
      name,
      email,
      password: hashedPassword,
      verificationToken: hashedVerificationToken,
      verificationTokenExpires: Date.now() + 3600000, 
    });

    // We wrap the queue call so a Redis hiccup doesn't crash the whole registration.
    try {
      await addMailJob({
        type: "verification",
        email: newUser.email,
        name: newUser.name,
        token: verificationToken // Send the raw token to the user
      });
    } catch (error) {
      console.error("Failed to queue email job:", error.message);
    }

    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isVerified: false,
      /// The raw OTP is returned so the UI can show it as a dev hint
      /// when no email service is configured. Remove this in production
      /// if you don't want the OTP exposed in the API response.
      otp: verificationToken,
    };
  }
}
