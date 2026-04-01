import bcrypt from "bcryptjs";
import User from "../users/user.model.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";
import { ROLES } from "../../constants/roles.js";
import { env } from "../../config/env.js";

// ------------------- REGISTER -------------------
export const register = async (req, res, next) => {
  try {
    const { name, email, password, image } = req.body;

    if (!name || !email || !password) {
      const error = new Error("name, email and password are required");
      error.statusCode = 400;
      throw error;
    }

    if (password.length < 6) {
      const error = new Error("Password must be at least 6 characters");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Email already in use");
      error.statusCode = 409;
      throw error;
    } 

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      image,
      password: hashedPassword,
      role: ROLES.CLIENT,
      provider: "local",
    });

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

    const isProd = env.NODE_ENV === "production";

    // Store tokens in HTTP-only cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
      maxAge: 30 * 60 * 1000, // 30 mins for access token
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ------------------- LOGIN -------------------
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }

    if(user && user.provider !== "local") {
      const error = new Error(`Email already registered via ${user.provider}. Please use ${user.provider} to login.`);
      error.statusCode = 409;
      throw error;
    } 
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid Password");
      error.statusCode = 401;
      throw error;
    }

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

    const isProd = env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
      maxAge: 30 * 60 * 1000, // 30 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ------------------- LOGOUT -------------------
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken", "", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    });

    res.clearCookie("refreshToken", "", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ------------------- REFRESH TOKEN -------------------
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

    const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });

    const isProd = env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

// ------------------- FETCH CURRENT USER -------------------
export const fetchMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("_id name email role image provider");
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// ------------------- GOOGLE CALLBACK -------------------
export const googleCallback = async (req, res) => {
  const user = req.user;

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

  const isProd = env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: isProd ? "None" : "Lax",
    path: "/",
    maxAge: 30 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(env.CLIENT_URL);
};
