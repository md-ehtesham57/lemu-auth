export class UserController {
  constructor(registerUserUseCase, loginUserUseCase, forgotPasswordUseCase) {
    this.registerUserUseCase = registerUserUseCase;
    this.loginUserUseCase = loginUserUseCase;
    this.forgotPasswordUseCase = forgotPasswordUseCase;
  }

  register = async (req, res, next) => {
    try {

      const user = await this.registerUserUseCase.execute(req.body);

      return res.status(201).json({
        success: true,
        message: "User registered successfully. Please verify your email.",
        data: { id: user._id, email: user.email }
      });
    } catch (error) {
      // If the Use Case fails (e.g., User already exists), this catches it.
      next(error);
    }
  };

  // --- LOGIN ---
  login = async (req, res, next) => {
    try {
      // Execute Use Case logic
      const user = await this.loginUserUseCase.execute(req.body);

      const token = this._generateToken(user.id);

      // Set Secure Cookie
      res.cookie("token", token, {
        httpOnly: true, // Prevents JS access
        secure: process.env.NODE_ENV === "production", // Only HTTPS in prod
        sameSite: "strict", // CSRF protection
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Internal helper for JWT
  _generateToken(userId) {
    return "dummy-token-for-now: hfkds20i4ngkj30u6kiu43";
  }

  forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;

      // Ensure 'this.' is present here!
      const result = await this.forgotPasswordUseCase.execute(email);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error); // Sends error to your errorMiddleware
    }
  };

  _generateToken(userId) {
    return "dummy-token-for-now: kfhdsj204nvkds04i0fkns"
  }
}