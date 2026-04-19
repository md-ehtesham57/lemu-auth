import { ZodError } from 'zod';

export const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error]: ${err.message}`);

  // ✅ More robust check for Zod Errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation Failed",
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Handle Business Logic Errors
  if (err.message === "USER_ALREADY_EXISTS") {
    return res.status(409).json({ success: false, message: "Email already in use" });
  }

  // Default Server Error
  res.status(500).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'development' ? err.message : "Internal Server Error" 
  });
};