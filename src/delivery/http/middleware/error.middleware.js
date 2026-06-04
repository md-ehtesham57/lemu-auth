import { ZodError } from "zod";

export const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error]: ${err.message}`);

  if (err instanceof ZodError || err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation Failed",
      errors: err.issues.map((e) => ({
        field: e.path[0] === "body" ? e.path.slice(1).join(".") : e.path.join("."),
        message: e.message,
      })),
    });
  }

  const errorMap = {
    USER_ALREADY_EXISTS: { status: 409, message: "Email already in use" },
    INVALID_CREDENTIALS: { status: 401, message: "Incorrect email or password" },
    EMAIL_NOT_VERIFIED: {
      status: 403,
      message: "Please verify your email before logging in",
    },
    INVALID_OR_EXPIRED_VERIFICATION_TOKEN: {
      status: 400,
      message: "Invalid or expired verification token",
    },
    INVALID_OR_EXPIRED_RESET_TOKEN: {
      status: 400,
      message: "Invalid or expired reset token",
    },
    ACCOUNT_LOCKED: {
      status: 423,
      message: "Account temporarily locked due to too many failed attempts. Try again later.",
    },
    ERR_EMAIL_SEND_FAILED: {
      status: 500,
      message: "Failed to send email. Please try again later.",
    },
  };

  if (errorMap[err.message]) {
    const { status, message } = errorMap[err.message];
    return res.status(status).json({ success: false, message });
  }

  const isDev = process.env.NODE_ENV === "development";
  res.status(err.status || 500).json({
    success: false,
    message: isDev ? err.message : "Internal Server Error",
    ...(isDev && { stack: err.stack }),
  });
};
