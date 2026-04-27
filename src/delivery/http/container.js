import { MongoUserRepository } from "../../infrastructure/repositories/MongoUserRepository.js";
import { PasswordService } from "../../infrastructure/services/PasswordService.js";
import { MailService } from "../../infrastructure/services/MailService.js";
import { RegisterUser } from "../../core/use-cases/RegisterUser.js";
import { LoginUser } from "../../core/use-cases/LoginUser.js";
import { UserController } from "./user.controller.js";
import { ForgotPassword } from "../../core/use-cases/ForgotPassword.js";

// 1. Instantiate Infrastructure
const userRepo = new MongoUserRepository();
const passwordService = new PasswordService();
const mailService = new MailService();

// 2. Instantiate Use Case with Infrastructure
const registerUserUseCase = new RegisterUser(userRepo, passwordService, mailService);

const loginUserUseCase = new LoginUser(userRepo, passwordService);

const forgotPasswordUseCase = new ForgotPassword(userRepo, mailService);

// 3. Instantiate Controller with Use Case
export const userController = new UserController(registerUserUseCase, loginUserUseCase);
