import crypto from "crypto";
import { addMailJob } from "../../infrastructure/queues/mail.queue.js";

export class RegisterUser {
  constructor(userRepository, passwordService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute(userData) {
    const { name, email, password } = userData;

    // 1. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("USER_ALREADY_EXISTS");
    }

    // 2. Hash Password using bcryptjs via our service
    const hashedPassword = await this.passwordService.hash(password);
    
    // 3. Generate Secure Token using crypto
    // Generates a 32-character hex string (e.g., 'f1e2d3...')
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 4. Persistence
    const newUser = await this.userRepository.save({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires: Date.now() + 3600000, // 1 hour expiry
    });

    // 5. Background Task (Redis Queue)
    await addMailJob({
      email: newUser.email,
      name: newUser.name,
      token: verificationToken
    });

    return newUser;
  }
}