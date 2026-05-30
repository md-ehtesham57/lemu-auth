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

    const isMatch = await this.passwordService.compare(password, user.password);

    if (!isMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

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
