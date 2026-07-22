const jwt = require("jsonwebtoken");
const Admin = require("../Models/admin.model");
const AppError = require("../Utils/appError");
const catchAsync = require("../Utils/catchAsync");
const appConfig = require("../Config/app.config");

/**
 * Extracts the Bearer token from the Authorization header.
 * @param {import("express").Request} req
 * @returns {string|null}
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};



const authenticateAdmin = catchAsync(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return next(new AppError("Unauthorized: No token provided", 401));
  }

  const jwtSecret = process.env.JWT_SECRET || process.env.JWT_TOKEN || appConfig.jwtSecret;

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Unauthorized: Token has expired", 401));
    }
    return next(new AppError("Unauthorized: Invalid token", 401));
  }

  // Support both current and older token payload shapes.
  const adminId = decoded.id || decoded._id || decoded.adminId;
  if (!adminId) {
    return next(new AppError("Unauthorized: Malformed token", 401));
  }

  const admin = await Admin.findById(adminId).select("-password");
  if (!admin) {
    return next(new AppError("Unauthorized: Admin not found", 401));
  }

  // Attach admin to request so downstream controllers can use req.admin
  req.admin = admin;
  req.user = admin;
  req.tokenPayload = decoded;
  next();
});

module.exports = authenticateAdmin;
