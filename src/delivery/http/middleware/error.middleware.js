export const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error]: ${err.message}`);

  // Handle Zod Validation Errors
  if (err.name === "ZodError") {
    return res.status(400).json({ success: false, errors: err.errors });
  }

  // Handle Business Logic Errors
  if (err.message === "USER_ALREADY_EXISTS") {
    return res.status(409).json({ success: false, message: "Email already in use" });
  }

  // Default Server Error
  res.status(500).json({ success: false, message: "Internal Server Error" });
};
