export class RegisterUser {
  constructor(userRepository, passwordService, mailService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.mailService = mailService;
  }

  async execute(userData) {
    const { name, email, password } = userData;

    // 1. Business Logic: Check if user exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("USER_ALREADY_EXISTS");
    }

    // 2. Data Preparation: Hash password & create token
    const hashedPassword = await this.passwordService.hash(password);
    const verificationToken = Math.random().toString(36).substring(2); // Simple token for now

    // 3. Persistence: Save to DB
    const newUser = await this.userRepository.save({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires: Date.now() + 3600000, // 1 hour
    });

    // 4. Communication: Send Email
    await this.mailService.sendVerificationEmail(email, verificationToken);

    return newUser;
  }
}
