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
    const [hashedPassword, verificationToken] = await Promise.all([
      this.passwordService.hash(password),
      Promise.resolve(crypto.randomBytes(32).toString('hex'))
    ]);

    // Ensure your Repository/Model has a unique index on 'email' as a final safety net.
    const newUser = await this.userRepository.save({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires: Date.now() + 3600000, 
    });

    // We wrap the queue call so a Redis hiccup doesn't crash the whole registration.
    try {
      await addMailJob({
        email: newUser.email,
        name: newUser.name,
        token: verificationToken
      });
    } catch (error) {
      console.error("Failed to queue email job:", error.message);
    }

    // Never return the hashed password or the verification token to the client.
    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isVerified: false
    };
  }
}