const AppError = require("../Utils/appError");

const authorizeRoles = (...roles) => (req, res, next) => {
  console.log("Required Roles:", roles);
  console.log("User:", req.user);

  if (!req.user) {
    return next(new AppError("Unauthorized", 401));
  }

  if (!roles.includes(req.user.role)) {
    console.log("Role Check Failed");
    return next(new AppError("Forbidden", 403));
  }
  console.log("===== ROLE =====");
console.log("Required Roles:", roles);
console.log("User Role:", req.user?.role);
  next();
};

module.exports = authorizeRoles;
