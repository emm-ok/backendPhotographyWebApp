import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
import { env } from "../config/env.js";

export const protect = async (req, res, next) => {
  try {
    console.log("Cookies received:", req.cookies);
    console.log("Headers:", req.headers);
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
