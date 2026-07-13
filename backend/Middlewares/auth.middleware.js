const jwt = require("jsonwebtoken");

const User = require("../Models/userModel.model");
const AppError = require("../Utils/appError");
const catchAsync = require("../Utils/catchAsync");
const appConfig = require("../Config/app.config");


const extractToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};

const authenticateUser = catchAsync(async (req, res, next) => {
  const token = extractToken(req);
  
  if (!token) {
    return next(new AppError("Unauthorized", 401));
  }
  
  let decoded;
  try {
    decoded = jwt.verify(token, appConfig.jwtSecret);
  } catch (error) {
    return next(new AppError("Unauthorized", 401));
  }
  
  const user = await User.findById(decoded.userId).select("-password");
  if (!user) {
    return next(new AppError("Unauthorized", 401));
  }
  
  req.user = user;
  req.tokenPayload = decoded;

  next();
  });

module.exports = authenticateUser;
