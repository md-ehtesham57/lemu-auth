import jwt from "jsonwebtoken";
import crypto from "crypto";
import { tokenBlacklist } from "../../infrastructure/services/TokenBlacklistService.js";

export class UserController {
  constructor(
    registerUserUseCase,
    loginUserUseCase,
    loginWithGoogleUseCase,
    forgotPasswordUseCase,
    verifyEmailUseCase,
    resetPasswordUseCase
  ) {
    this.registerUserUseCase = registerUserUseCase;
    this.loginUserUseCase = loginUserUseCase;
    this.loginWithGoogleUseCase = loginWithGoogleUseCase;
    this.forgotPasswordUseCase = forgotPasswordUseCase;
    this.verifyEmailUseCase = verifyEmailUseCase;
    this.resetPasswordUseCase = resetPasswordUseCase;
  }

  _generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, name: user.name, jti: crypto.randomUUID() },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
  }

  register = async (req, res, next) => {
    try {
      const user = await this.registerUserUseCase.execute(req.body);

      return res.status(201).json({
        success: true,
        message: "User registered successfully. Please verify your email.",
        data: { id: user.id, email: user.email, ...(user.otp ? { otp: user.otp } : {}) },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const user = await this.loginUserUseCase.execute(req.body);

      const token = this._generateToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      const responseData = {
        success: true,
        message: "Login successful.",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      };

      if (req.isApiRequest) {
        responseData.data.token = token;
      }

      return res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  };

  google = async (req, res, next) => {
    try {
      const user = await this.loginWithGoogleUseCase.execute(req.body.credential);

      const token = this._generateToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      const responseData = {
        success: true,
        message: "Google sign-in successful.",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            picture: user.picture,
          },
        },
      };

      if (req.isApiRequest) {
        responseData.data.token = token;
      }

      return res.status(200).json(responseData);
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
      const token = req.cookies?.token;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded.jti) {
            await tokenBlacklist.add(decoded.jti, 86400);
          }
        } catch {
          // Token already invalid; proceed with clearing cookie
        }
      }

      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
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
