import jwt from "jsonwebtoken";
import { tokenBlacklist } from "../services/TokenBlacklistService.js";

export const authenticate = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.jti) {
      const blacklisted = await tokenBlacklist.isBlacklisted(decoded.jti);
      if (blacklisted) {
        return res.status(401).json({ success: false, message: "Token has been revoked" });
      }
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
