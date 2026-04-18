import { registerSchema } from "../../shared/schemas/authSchema.js";

export class UserController {
  constructor(registerUserUseCase) {
    this.registerUserUseCase = registerUserUseCase;
  }

  register = async (req, res, next) => {
    try {
      // ✅ 1. Validate Input (Fast fail)
      const validatedData = registerSchema.parse(req.body);

      // ✅ 2. Execute Use Case
      const user = await this.registerUserUseCase.execute(validatedData);

      // ✅ 3. Send Response
      return res.status(201).json({
        success: true,
        message: "User registered successfully. Please verify your email.",
        data: { id: user._id, email: user.email }
      });
    } catch (error) {
      // Pass to global error handler
      next(error);
    }
  };
}
