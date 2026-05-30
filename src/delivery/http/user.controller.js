import jwt from "jsonwebtoken";

export class UserController {
  constructor(
    registerUserUseCase,
    loginUserUseCase,
    forgotPasswordUseCase,
    verifyEmailUseCase,
    resetPasswordUseCase
  ) {
    this.registerUserUseCase = registerUserUseCase;
    this.loginUserUseCase = loginUserUseCase;
    this.forgotPasswordUseCase = forgotPasswordUseCase;
    this.verifyEmailUseCase = verifyEmailUseCase;
    this.resetPasswordUseCase = resetPasswordUseCase;
  }

  _generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
  }

  register = async (req, res, next) => {
    try {
      const user = await this.registerUserUseCase.execute(req.body);

      return res.status(201).json({
        success: true,
        message: "User registered successfully. Please verify your email.",
        data: { id: user.id, email: user.email },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const user = await this.loginUserUseCase.execute(req.body);

      const token = this._generateToken(user.id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const result = await this.forgotPasswordUseCase.execute(email);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req, res, next) => {
    try {
      const { token } = req.body;
      const result = await this.verifyEmailUseCase.execute(token);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const { token, password } = req.body;
      const result = await this.resetPasswordUseCase.execute(token, password);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(200).json({
        success: true,
        message: "Logged out successfully.",
      });
    } catch (error) {
      next(error);
    }
  };
}
