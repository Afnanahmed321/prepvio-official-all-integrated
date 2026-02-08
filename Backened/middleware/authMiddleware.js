import jwt from "jsonwebtoken";
import { User } from "../Models/User.js";

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Check Authorization header if no cookie
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - invalid token",
      });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - user not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("verifyToken error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const isAdmin = (req, res, next) => {
  const userRole = req.user?.role?.toLowerCase();

  if (userRole === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin access only.'
    });
  }
};

export const authenticate = verifyToken;
