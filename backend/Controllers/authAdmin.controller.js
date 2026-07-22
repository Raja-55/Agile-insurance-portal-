const express = require("express");
const Admin = require("../Models/admin.model");
const jwt = require("jsonwebtoken");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
const { transporter } = require("../Config/nodmailer");
const crypto = require("crypto");

// const registerAdmin = catchAsync(async (req, res, next) => {
//     try{
//         const { fullname, fullName, email, phone, password, role } = req.body;
//         const resolvedFullName = fullName || fullname;

//         const existing = await Admin.findOne({
//             $or: [{ email }, { phone }],
//         });

//         if (existing) {
//             return next(new AppError("Email or phone already exists", 409));
//         }

//         const admin = await Admin.create({
//             fullName: resolvedFullName,
//             email,
//             phone,
//             password,
//             role: role || "Support Executive",
//         });


//         res.status(201).json({
//             success: true,
//             message: "Admin registration successful",
//             data: {
//                 admin: {
//                     id: admin._id,
//                     fullName: admin.fullName,
//                     email: admin.email,
//                     phone: admin.phone,
//                     role: admin.role,
//                 },
//             },
//         });
//     }
//     catch (error) {
//         console.error(error);
//         // Mongoose validation errors get field-specific messages and a 400 status.
//         if (error.name === "ValidationError") {
//             const messages = Object.values(error.errors).map((e) => e.message);
//             return next(new AppError(messages.join(", "), 400));
//         }
//         // Duplicate key error (e.g. unique email/phone race condition)
//         if (error.code === 11000) {
//             return next(new AppError("Email or phone already exists", 409));
//         }
//         return next(new AppError(error.message || "Internal server error", 500));
//     }
// });

const loginAdmin = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Email and password required", 400));
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return next(new AppError("Invalid credentials", 401));
    }

    if (!admin.isActive) {
      return next(new AppError("Admin account is disabled", 403));
    }

    const matched = await admin.comparePassword(password);
    if (!matched) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Check if 2FA is enabled
    if (admin.twoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      admin.two_factor_code = otp;
      admin.two_factor_expiry = new Date(Date.now() + 5 * 60 * 1000);
      await admin.save({ validateBeforeSave: false });

      const mailOptions = {
        from: process.env.SENDER_EMAIL || '"Agile Insurance" <no-reply@agileinsure.in>',
        to: admin.email,
        subject: 'Admin 2FA Verification Code - Agile Insurance',
        text: `Your 2FA authentication code is ${otp}. It will expire in 5 minutes.`,
        html: `<p>Your 2FA authentication code is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
      };
      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        require2FA: true,
        message: "2FA code sent to your email",
        email: admin.email,
      });
    }

    admin.lastLoginAt = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        email: admin.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        admin: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          profilePhoto: admin.profilePhoto,
        },
        token,
      },
    });
  }
  catch (error) {
    console.error(error);
    return next(new AppError(error.message, 500));
  }
});
const createAdmin = catchAsync(async (req, res, next) => {
  try {
    const { fullName, fullname, email, phone, password, role, permissions } = req.body;
    const resolvedFullName = fullName || fullname;

    if (!resolvedFullName || !email || !phone || !password || !role) {
      return next(new AppError("Full name, email, phone, password, and role are required.", 400));
    }

    const existing = await Admin.findOne({
      $or: [{ email }, { phone }],
    });

    if (existing) {
      return next(new AppError("Email or phone already exists", 409));
    }

    const admin = await Admin.create({
      fullName: resolvedFullName,
      email,
      phone,
      password,
      role,
      permissions: Array.isArray(permissions) ? permissions : [],
      createdBy: req.admin?._id || null,
    });

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      data: {
        admin: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          permissions: admin.permissions,
          isActive: admin.isActive,
          createdAt: admin.createdAt,
        },
      },
    });
  }
  catch (error) {
    console.error(error);
    // Mongoose validation errors get field-specific messages and a 400 status.
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return next(new AppError(messages.join(", "), 400));
    }
    // Duplicate key error (e.g. unique email/phone race condition)
    if (error.code === 11000) {
      return next(new AppError("Email or phone already exists", 409));
    }
    return next(new AppError(error.message || "Internal server error", 500));
  }
});

/**
 * getAllAdmins
 * SuperAdmin-only. Lists every admin account (used by the role/registry list
 * on the System Settings > Admin Registration panel).
 */
const getAllAdmins = catchAsync(async (req, res, next) => {
  const admins = await Admin.find()
    .select("-password")
    .populate("createdBy", "fullName email role")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: admins,
  });
});

/**
 * updateAdminStatus
 * SuperAdmin-only. Activate/deactivate another admin account, or change role/permissions.
 */
const updateAdminStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { isActive, role, permissions } = req.body;

  if (String(id) === String(req.admin._id) && isActive === false) {
    return next(new AppError("You cannot deactivate your own account.", 400));
  }

  const update = {};
  if (typeof isActive === "boolean") update.isActive = isActive;
  if (role) update.role = role;
  if (Array.isArray(permissions)) update.permissions = permissions;

  const admin = await Admin.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Admin updated successfully",
    data: { admin },
  });
});
// === Add to authAdmin.controller.js ===
// Public, unauthenticated. Returns ONLY safe display fields — no password,
// no permissions — so the login screen can list real admins/roles without
// requiring a token first.
const getPublicRoster = catchAsync(async (req, res, next) => {
  const admins = await Admin.find({ isActive: true })
    .select("fullName role email profilePhoto isActive")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: admins });
});

const verify2FAAdmin = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return next(new AppError("Email and OTP code are required", 400));
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  if (admin.two_factor_code !== otp) {
    return next(new AppError("Invalid 2FA code", 400));
  }

  if (admin.two_factor_expiry < new Date()) {
    return next(new AppError("2FA code expired", 400));
  }

  // Clear code
  admin.two_factor_code = undefined;
  admin.two_factor_expiry = undefined;
  admin.lastLoginAt = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = jwt.sign(
    {
      id: admin._id,
      role: admin.role,
      email: admin.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  res.status(200).json({
    success: true,
    message: "Admin login successful via 2FA",
    data: {
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        profilePhoto: admin.profilePhoto,
      },
      token,
    },
  });
});

const forgotPasswordAdmin = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return next(new AppError("Admin account not found", 404));
  }

  const token = crypto.randomBytes(32).toString("hex");
  admin.reset_password_token = token;
  admin.reset_password_expiry = new Date(Date.now() + 30 * 60 * 1000);
  await admin.save({ validateBeforeSave: false });

  const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${token}&type=admin`;

  const mailOptions = {
    from: process.env.SENDER_EMAIL || '"Agile Insurance" <no-reply@agileinsure.in>',
    to: email,
    subject: 'Admin Reset Password - Agile Insurance Portal',
    text: `You requested to reset your admin password. Click the link to proceed: ${resetLink}`,
    html: `<p>You requested to reset your admin password.</p><p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 30 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);

  return res.status(200).json({
    success: true,
    message: "Admin password reset link sent to your email",
  });
});

const resetPasswordAdmin = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return next(new AppError("Token and password are required", 400));
  }

  const admin = await Admin.findOne({
    reset_password_token: token,
    reset_password_expiry: { $gt: new Date() },
  });

  if (!admin) {
    return next(new AppError("Invalid or expired reset token", 400));
  }

  admin.password = password;
  admin.reset_password_token = undefined;
  admin.reset_password_expiry = undefined;
  await admin.save();

  return res.status(200).json({
    success: true,
    message: "Admin password reset successfully.",
  });
});

module.exports = {
  loginAdmin,
  createAdmin,
  getAllAdmins,
  updateAdminStatus,
  getPublicRoster,
  verify2FAAdmin,
  forgotPasswordAdmin,
  resetPasswordAdmin,
};
