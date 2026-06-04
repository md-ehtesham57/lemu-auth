export const apiKeyAuth = (req, res, next) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return next();

  const providedKey = req.headers["x-api-key"];
  if (providedKey && providedKey === apiKey) {
    req.isApiRequest = true;
  }

  next();
};
