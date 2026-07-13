// role.middleware.js
const AppError = require("../Utils/appError");

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Unauthorized", 401));
  }

  // Default to "user" if role field is missing (handles legacy documents)
  const userRole = req.user.role || "user";

  if (!roles.includes(userRole)) {
    return next(new AppError("Forbidden", 403));
  }

  next();
};

module.exports = authorizeRoles;