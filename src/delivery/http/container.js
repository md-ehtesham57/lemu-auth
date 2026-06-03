import { MongoUserRepository } from "../../infrastructure/repositories/MongoUserRepository.js";
import { PasswordService } from "../../infrastructure/services/PasswordService.js";
import { MailService } from "../../infrastructure/services/MailService.js";
import { RegisterUser } from "../../core/use-cases/RegisterUser.js";
import { LoginUser } from "../../core/use-cases/LoginUser.js";
import { ForgotPassword } from "../../core/use-cases/ForgotPassword.js";
import { VerifyEmail } from "../../core/use-cases/VerifyEmail.js";
import { ResetPassword } from "../../core/use-cases/ResetPassword.js";
import { UserController } from "./user.controller.js";

const userRepo = new MongoUserRepository();
const passwordService = new PasswordService();
const mailService = new MailService();

const registerUserUseCase = new RegisterUser(userRepo, passwordService);
const loginUserUseCase = new LoginUser(userRepo, passwordService);
const forgotPasswordUseCase = new ForgotPassword(userRepo);
const verifyEmailUseCase = new VerifyEmail(userRepo);
const resetPasswordUseCase = new ResetPassword(userRepo, passwordService);

export const userController = new UserController(
  registerUserUseCase,
  loginUserUseCase,
  forgotPasswordUseCase,
  verifyEmailUseCase,
  resetPasswordUseCase
);
