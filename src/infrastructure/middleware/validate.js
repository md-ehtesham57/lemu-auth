import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({ body: req.body });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        status: "fail",
        errors: error.issues.map((err) => ({
          field: err.path.slice(1).join("."),
          message: err.message,
        })),
      });
    }

    next(error);
  }
};
