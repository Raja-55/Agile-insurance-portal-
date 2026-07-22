const User = require("../Models/userModel.model");
const TempOtp = require("../Models/tempOtp.model");
const { signToken } = require("../Utils/jwt");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
const { jwtExpiresIn } = require("../Config/app.config");
const { transporter } = require("../Config/nodmailer");
const crypto = require("crypto");

const buildAuthResponse = (user) => {
  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    token,
    user: user.toJSON ? user.toJSON() : user,
  };
};

const register = catchAsync(async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      dob,
      gender,
      address,
      profile_image,
    } = req.body;

    // Check if email or phone already exists in database
    const existing = await User.findOne({
      $or: [{ email }, ...(phone ? [{ phone }] : [])],
    });

    if (existing) {
      return next(new AppError("Email or phone already exists", 409));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save or update temp OTP record
    await TempOtp.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    const mailOptions = {
      from: process.env.SENDER_EMAIL || '"Agile Insurance" <no-reply@agileinsure.in>',
      to: email,
      subject: 'Verify your Agile Insurance account',
      text: `Your OTP for verification is ${otp}. It will expire in 10 minutes.`,
      html: `<p>Thank you for registering. Your OTP for account verification is <b>${otp}</b>. It will expire in 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      success: true,
      requireVerification: true,
      email: email,
      message: "Please verify your email with the OTP sent to your mailbox.",
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Registration failed", 500));
  }
});

const verifyRegisterOtp = catchAsync(async (req, res, next) => {
  try {
    const { email, otp, fullName, phone, password, address, dob, gender, profile_image } = req.body;

    if (!email || !otp) {
      return next(new AppError("Email and OTP are required", 400));
    }

    // Verify OTP
    const tempRecord = await TempOtp.findOne({ email: email.toLowerCase() });
    if (!tempRecord) {
      return next(new AppError("OTP not found or expired. Please register again.", 400));
    }

    if (tempRecord.otp !== otp) {
      return next(new AppError("Invalid OTP code", 400));
    }

    if (tempRecord.expiresAt < new Date()) {
      return next(new AppError("OTP code has expired", 400));
    }

    // Check if email or phone already exists just in case
    const existing = await User.findOne({
      $or: [{ email }, ...(phone ? [{ phone }] : [])],
    });

    if (existing) {
      return next(new AppError("Email or phone already exists", 409));
    }

    // Clean up OTP record
    await TempOtp.deleteOne({ _id: tempRecord._id });

    // Now, create the user in the database with is_verified: true!
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      dob,
      gender,
      address,
      profile_image,
      is_verified: true, // Verification is true in the database!
      kyc_status: "pending",
    });

    const auth = buildAuthResponse(user);
    res.cookie('token', auth.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Verification and registration successful",
      data: auth,
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Verification failed", 500));
  }
});

const sendVerifyotp = catchAsync(async (req, res, next) => {
  try {
    const email = req.user?.email || req.body.email;
    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verification_otp = otp;
    user.verification_otp_expiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL || '"Agile Insurance" <no-reply@agileinsure.in>',
      to: email,
      subject: 'Email Verification OTP - Agile Insurance Portal',
      text: `Your OTP for verification is ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your OTP for email verification is <b>${otp}</b>. It will expire in 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Failed to send OTP", 500));
  }
});

const verifyUser = catchAsync(async (req, res, next) => {
  try {
    const email = req.user?.email || req.body.email;
    const { otp } = req.body;

    if (!email || !otp) {
      return next(new AppError("Email and OTP are required", 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.verification_otp !== otp) {
      return next(new AppError("Invalid OTP", 400));
    }

    if (user.verification_otp_expiry < new Date()) {
      return next(new AppError("OTP expired", 400));
    }

    user.is_verified = true;
    user.verification_otp = undefined;
    user.verification_otp_expiry = undefined;
    await user.save();

    const auth = buildAuthResponse(user);
    res.cookie('token', auth.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      data: auth,
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Failed to verify user", 500));
  }
});

const verify2FAUser = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return next(new AppError("Email and OTP code are required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.two_factor_code !== otp) {
    return next(new AppError("Invalid 2FA code", 400));
  }

  if (user.two_factor_expiry < new Date()) {
    return next(new AppError("2FA code expired", 400));
  }

  user.two_factor_code = undefined;
  user.two_factor_expiry = undefined;
  await user.save();

  const auth = buildAuthResponse(user);
  res.cookie('token', auth.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "2FA verification successful",
    data: auth,
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.reset_password_token = token;
  user.reset_password_expiry = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${token}&type=user`;

  const mailOptions = {
    from: process.env.SENDER_EMAIL || '"Agile Insurance" <no-reply@agileinsure.in>',
    to: email,
    subject: 'Reset Password - Agile Insurance Portal',
    text: `You requested to reset your password. Click the link to proceed: ${resetLink}`,
    html: `<p>You requested to reset your password.</p><p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 30 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);

  return res.status(200).json({
    success: true,
    message: "Password reset link sent to your email",
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return next(new AppError("Token and password are required", 400));
  }

  const user = await User.findOne({
    reset_password_token: token,
    reset_password_expiry: { $gt: new Date() },
  });

  if (!user) {
    return next(new AppError("Invalid token or token expired", 400));
  }

  user.password = password;
  user.reset_password_token = undefined;
  user.reset_password_expiry = undefined;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password reset successful.",
  });
});

const login = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    const matched = await user.comparePassword(password);
    if (!matched) {
      return next(new AppError("Invalid email or password", 401));
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.two_factor_code = otp;
      user.two_factor_expiry = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();

      const mailOptions = {
        from: process.env.SENDER_EMAIL || '"Agile Insurance" <no-reply@agileinsure.in>',
        to: user.email,
        subject: '2FA Verification Code - Agile Insurance',
        text: `Your 2FA authentication code is ${otp}. It will expire in 5 minutes.`,
        html: `<p>Your 2FA authentication code is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
      };
      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        require2FA: true,
        message: "2FA code sent to your email",
        email: user.email,
      });
    }

    const auth = buildAuthResponse(user);
    res.cookie('token', auth.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: auth,
    });
  }
  catch (error) {
    console.log(error);
    return next(new AppError("Failed to login", 500));
  }
});

const logout = catchAsync(async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
    });
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Failed to logout", 500));
  }
}
);

const me = catchAsync(async (req, res, next) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
});

const updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = [
    "fullName",
    "email",
    "phone",
    "dob",
    "gender",
    "address",
    "profile_image",
    "kyc_status",
    "twoFactorEnabled",
  ];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const duplicate = await User.findOne({
    _id: { $ne: req.user._id },
    $or: [
      ...(updateData.email ? [{ email: updateData.email }] : []),
      ...(updateData.phone ? [{ phone: updateData.phone }] : []),
    ],
  });

  if (duplicate) {
    return next(new AppError("Email or phone already exists", 409));
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

const changePassword = catchAsync(async (req, res, next) => {
  const { current_password, new_password } = req.body;

  const user = await User.findById(req.user._id);
  const matched = await user.comparePassword(current_password);
  if (!matched) {
    return next(new AppError("Current password is incorrect", 400));
  }

  user.password = new_password;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

const googleOAuthLogin = catchAsync(async (req, res, next) => {
  const { idToken, accessToken, profile } = req.body;
  let email, fullName, profile_image, googleId;

  if (idToken) {
    try {
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!verifyRes.ok) {
        throw new Error("Failed to verify Google token");
      }
      const payload = await verifyRes.json();
      email = payload.email;
      fullName = payload.name;
      profile_image = payload.picture;
      googleId = payload.sub;
    } catch (err) {
      console.error("Google token verification failed:", err.message);
      if (profile && profile.email) {
        email = profile.email;
        fullName = profile.name || profile.fullName;
        profile_image = profile.picture || profile.profile_image;
        googleId = profile.id || profile.googleId;
      } else {
        return next(new AppError("Invalid Google token or verification failed", 400));
      }
    }
  } else if (accessToken) {
    try {
      const verifyRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      if (!verifyRes.ok) {
        throw new Error("Failed to verify Google access token");
      }
      const payload = await verifyRes.json();
      email = payload.email;
      fullName = payload.name;
      profile_image = payload.picture;
      googleId = payload.sub;
    } catch (err) {
      console.error("Google access token verification failed:", err.message);
      if (profile && profile.email) {
        email = profile.email;
        fullName = profile.name || profile.fullName;
        profile_image = profile.picture || profile.profile_image;
        googleId = profile.id || profile.googleId;
      } else {
        return next(new AppError("Invalid Google access token or verification failed", 400));
      }
    }
  } else if (profile && profile.email) {
    email = profile.email;
    fullName = profile.name || profile.fullName;
    profile_image = profile.picture || profile.profile_image;
    googleId = profile.id || profile.googleId;
  } else {
    return next(new AppError("Google token, access token, or profile details are required", 400));
  }

  let user = await User.findOne({ email });
  if (!user) {
    const randomPhone = `00${Math.floor(10000000 + Math.random() * 90000000)}`;
    user = await User.create({
      fullName: fullName || "Google User",
      email,
      phone: randomPhone,
      password: `oauth_google_${googleId || Date.now()}`,
      is_verified: true,
      kyc_status: "pending",
      profile_image: profile_image || "",
    });
  }

  const auth = buildAuthResponse(user);
  return res.status(200).json({
    success: true,
    message: "Google login successful",
    data: auth,
  });
});

const facebookOAuthLogin = catchAsync(async (req, res, next) => {
  const { accessToken, profile } = req.body;
  let email, fullName, profile_image, facebookId;

  if (accessToken) {
    try {
      const verifyRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`);
      if (!verifyRes.ok) {
        throw new Error("Failed to verify Facebook token");
      }
      const payload = await verifyRes.json();
      email = payload.email || `${payload.id}@facebook.demo`;
      fullName = payload.name;
      profile_image = payload.picture?.data?.url;
      facebookId = payload.id;
    } catch (err) {
      console.error("Facebook token verification failed:", err.message);
      if (profile && profile.email) {
        email = profile.email;
        fullName = profile.name || profile.fullName;
        profile_image = profile.picture || profile.profile_image;
        facebookId = profile.id || profile.facebookId;
      } else {
        return next(new AppError("Invalid Facebook token or verification failed", 400));
      }
    }
  } else if (profile && profile.email) {
    email = profile.email;
    fullName = profile.name || profile.fullName;
    profile_image = profile.picture || profile.profile_image;
    facebookId = profile.id || profile.facebookId;
  } else {
    return next(new AppError("Facebook token or profile details are required", 400));
  }

  let user = await User.findOne({ email });
  if (!user) {
    const randomPhone = `00${Math.floor(10000000 + Math.random() * 90000000)}`;
    user = await User.create({
      fullName: fullName || "Facebook User",
      email,
      phone: randomPhone,
      password: `oauth_facebook_${facebookId || Date.now()}`,
      is_verified: true,
      kyc_status: "pending",
      profile_image: profile_image || "",
    });
  }

  const auth = buildAuthResponse(user);
  return res.status(200).json({
    success: true,
    message: "Facebook login successful",
    data: auth,
  });
});

module.exports = {
  register,
  verifyRegisterOtp,
  login,
  logout,
  me,
  updateProfile,
  changePassword,
  sendVerifyotp,
  verifyUser,
  verify2FAUser,
  forgotPassword,
  resetPassword,
  googleOAuthLogin,
  facebookOAuthLogin,
};
