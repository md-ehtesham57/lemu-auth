export class LoginUser {
  constructor(userRepository, passwordService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute(credentials) {
    const { email, password } = credentials;

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      throw new Error("ACCOUNT_LOCKED");
    }

    const isMatch = await this.passwordService.compare(password, user.password);

    if (!isMatch) {
      await this.userRepository.incrementLoginAttempts(user._id);
      throw new Error("INVALID_CREDENTIALS");
    }

    await this.userRepository.resetLoginAttempts(user._id);

    if (!user.isVerified) {
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    };
  }
}
