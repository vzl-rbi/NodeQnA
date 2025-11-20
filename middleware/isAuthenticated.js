import { promisify } from "util";
import jwt from "jsonwebtoken";
import { users } from "../model/index.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.jwtToken;

    if (!token) {
      console.log("No token found. Redirecting to login...");
      return res.redirect("/login");
    }

    // Verify token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET || "superweak-secret"
    );

    console.log("🔐 Decoded Token:", decoded);

    // Find user from DB
    const user = await users.findByPk(decoded.id);

    if (!user) {
      console.log("❌ No user found for ID:", decoded.id);
      return res.send("No user belongs to that ID");
    }

    // Save user ID to request
    req.userId = user.id;

    // Log neatly (this shows in terminal)
    console.log("✅ Authenticated User ID:", req.userId);

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.redirect("/login");
  }
};
