export const apiKeyAuth = (req, res, next) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return next();

  const providedKey = req.headers["x-api-key"];
  if (!providedKey || providedKey !== apiKey) {
    return res.status(401).json({ success: false, message: "Invalid or missing API key" });
  }

  req.isApiRequest = true;
  next();
};
