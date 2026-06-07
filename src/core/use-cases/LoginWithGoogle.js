import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export class LoginWithGoogle {
  constructor(userRepository, passwordService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute(credential) {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await this.passwordService.hash(randomPassword);

      user = await this.userRepository.save({
        name: name || email.split("@")[0],
        email,
        password: hashedPassword,
        isVerified: true,
        googleId,
        picture,
      });
    }

    if (!user.isVerified) {
      await this.userRepository.verifyEmail(user._id || user.id);
    }

    return {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      picture: user.picture || picture,
    };
  }
}
