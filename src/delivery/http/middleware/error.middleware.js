import { ZodError } from 'zod';

export const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error]: ${err.message}`);

  // More robust check for Zod Errors
  if (err instanceof ZodError || err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: "Validation Failed",
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

const errorMap = {
    "USER_ALREADY_EXISTS": { status: 409, message: "Email already in use" },
    "INVALID_CREDENTIALS": { status: 401, message: "Incorrect email or password" },
    "MISSING_CREDENTIALS": { status: 400, message: "Email and password are required" }
  };

  if (errorMap[err.message]) {
    const { status, message } = errorMap[err.message];
    return res.status(status).json({ success: false, message });
  }

  // 4. Final Fallback
  const isDev = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({ 
    success: false, 
    message: isDev ? err.message : "Internal Server Error",
    ...(isDev && { stack: err.stack }) // Useful for debugging that 400
  });
};