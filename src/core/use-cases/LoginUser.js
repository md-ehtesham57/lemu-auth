export class LoginUser {
  constructor(userRepository, passwordService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute(credentials) {
    const data = credentials.body || credentials;
    const { email, password } = data;

    // 1. Fetch User from MongoDB
    const user = await this.userRepository.findByEmail(email);

    // 2. Security: Unified Error Message 🛡️
    // We throw the same error regardless of whether the email exists 
    // or the password is wrong to prevent "Account Enumeration" attacks.
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // 3. Verify Password
    const isMatch = await this.passwordService.compare(password, user.password);
    
    if (!isMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // 4. Return "Clean" User Data
    // We convert to a plain object and remove the sensitive fields 
    // so they never accidentally end up in a JWT or API response.
    const userObject = user.toObject ? user.toObject() : user;
    const { password: _, verificationToken: __, ...safeUser } = userObject;

    return safeUser;
  }
}