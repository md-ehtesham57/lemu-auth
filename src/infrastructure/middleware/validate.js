export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error.issues) {
      return res.status(400).json({
        status: 'fail',
        errors: error.issues.map(err => ({
          field: err.path[0],
          message: err.message
        }))
      });
    }

    // Fallback for non-Zod errors
    next(error);
  }
};