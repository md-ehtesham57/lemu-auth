export class UserController {
  constructor(registerUserUseCase) {
    this.registerUserUseCase = registerUserUseCase;
  }

  register = async (req, res, next) => {
    try {
      // 🛡️ No need to parse again! The middleware already did this.
      // req.body is already validated by the time it gets here.
      
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
}