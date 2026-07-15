const User = require("../Models/userModel.model");
const TempOtp = require("../Models/tempOtp.model");

const { signToken } = require("../Utils/jwt");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");

const { transporter } = require("../Config/nodmailer");

const crypto = require("crypto");


// ======================================================
// COOKIE OPTIONS
// ======================================================

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? "strict"
      : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});


// ======================================================
// BUILD AUTH RESPONSE
// ======================================================

const buildAuthResponse = (user) => {
  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  return {
    token,
    user: user.toJSON
      ? user.toJSON()
      : user,
  };
};


// ======================================================
// REGISTER USER
// ======================================================

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


    if (!fullName || !email || !password) {
      return next(
        new AppError(
          "Full name, email, and password are required",
          400
        )
      );
    }


    const normalizedEmail = email
      .toLowerCase()
      .trim();


    const existing = await User.findOne({
      $or: [
        { email: normalizedEmail },
        ...(phone ? [{ phone }] : []),
      ],
    });


    if (existing) {
      return next(
        new AppError(
          "Email or phone already exists",
          409
        )
      );
    }


    // Create unverified user

    const user = await User.create({
      fullName,
      email: normalizedEmail,
      phone,
      password,
      dob,
      gender,
      address,
      profile_image,
      is_verified: false,
      kyc_status: "pending",
    });


    // Generate OTP

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();


    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );


    await TempOtp.findOneAndUpdate(
      {
        email: normalizedEmail || email.toLowerCase(),
      },
      {
        otp,
        expiresAt,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );


    const mailOptions = {
      from:
        process.env.SENDER_EMAIL ||
        '"Agile Insurance" <no-reply@agileinsure.in>',

      to: normalizedEmail|| email,

      subject:
        "Verify your Agile Insurance account",

      text:
        `Your OTP for verification is ${otp}. It will expire in 10 minutes.`,

      html:
        `<p>Thank you for registering.</p>
         <p>Your OTP for account verification is <b>${otp}</b>.</p>
         <p>It will expire in 10 minutes.</p>`,
    };


    try {
      await transporter.sendMail(mailOptions);

    } catch (mailError) {
      console.error(
        "Registration email error:",
        mailError
      );


      // Rollback registration if OTP email fails

      await User.deleteOne({
        _id: user._id,
      });


      await TempOtp.deleteOne({
        email: normalizedEmail,
      });


      return next(
        new AppError(
          "Unable to send verification OTP. Please try again.",
          500
        )
      );
    }


    return res.status(201).json({
      success: true,

      requireVerification: true,

      email: normalizedEmail,

      message:
        "Registration successful. Please verify your email with the OTP sent to your mailbox.",
    });

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );


    if (error.name === "ValidationError") {
      const messages = Object.values(
        error.errors
      ).map((err) => err.message);


      return next(
        new AppError(
          messages.join(", "),
          400
        )
      );
    }


    if (error.code === 11000) {
      return next(
        new AppError(
          "Email or phone already exists",
          409
        )
      );
    }


    return next(
      new AppError(
        error.message ||
          "Registration failed",
        500
      )
    );
  }
});


const verifyRegisterOtp = catchAsync(async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new AppError("Email and OTP are required", 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find OTP record
    const tempRecord = await TempOtp.findOne({
      email: normalizedEmail,
    });

    if (!tempRecord) {
      return next(
        new AppError(
          "OTP not found or expired. Please register again.",
          400
        )
      );
    }

    // Verify OTP
    if (tempRecord.otp !== otp) {
      return next(new AppError("Invalid OTP code", 400));
    }

    if (tempRecord.expiresAt < new Date()) {
      await TempOtp.deleteOne({ _id: tempRecord._id });

      return next(new AppError("OTP code has expired", 400));
    }

    // Find the already-created user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Already verified?
    if (user.is_verified) {
      return next(new AppError("User is already verified", 400));
    }

    // Mark verified
    user.is_verified = true;
    await user.save();

    // Delete OTP record
    await TempOtp.deleteOne({
      _id: tempRecord._id,
    });

    const auth = buildAuthResponse(user);

    res.cookie("token", auth.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "strict"
          : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Verification successful",
      data: auth,
    });
  } catch (error) {
    console.error("Verify Register OTP Error:", error);
    return next(
      new AppError(
        error.message || "Verification failed",
        500
      )
    );
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


// ======================================================
// LOGIN USER
// ======================================================

const login = catchAsync(
  async (req, res, next) => {
    try {
      const {
        email,
        password,
      } = req.body;


      if (!email || !password) {
        return next(
          new AppError(
            "Email and password are required",
            400
          )
        );
      }


      const normalizedEmail = email
        .toLowerCase()
        .trim();


      const user = await User.findOne({
        email: normalizedEmail,
      });


      if (!user) {
        return next(
          new AppError(
            "Invalid email or password",
            401
          )
        );
      }


      const matched =
        await user.comparePassword(
          password
        );


      if (!matched) {
        return next(
          new AppError(
            "Invalid email or password",
            401
          )
        );
      }


      // Require email verification

      if (!user.is_verified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        user.verification_otp = otp;
        user.verification_otp_expiry = expiresAt;
        await user.save({ validateBeforeSave: false });

        try {
          await transporter.sendMail({
            from: process.env.SENDER_EMAIL || '"Agile Insurance" <no-reply@agileinsure.in>',
            to: user.email,
            subject: "Email Verification OTP - Agile Insurance Portal",
            text: `Your OTP for verification is ${otp}. It will expire in 10 minutes.`,
            html: `<p>Your OTP for email verification is <b>${otp}</b>.</p><p>It will expire in 10 minutes.</p>`,
          });
        } catch (mailError) {
          console.error("Login OTP email error:", mailError);
        }

        return res.status(200).json({
          success: true,
          requireVerification: true,
          email: normalizedEmail,
          message: "Please verify your email before logging in. A new verification code has been sent to your inbox.",
        });
      }


      // ------------------------------------------------
      // CHECK 2FA
      // ------------------------------------------------

      if (user.twoFactorEnabled) {
        const otp = Math.floor(
          100000 +
            Math.random() * 900000
        ).toString();


        user.two_factor_code = otp;

        user.two_factor_expiry =
          new Date(
            Date.now() + 5 * 60 * 1000
          );


        await user.save({
          validateBeforeSave: false,
        });


        const mailOptions = {
          from:
            process.env.SENDER_EMAIL ||
            '"Agile Insurance" <no-reply@agileinsure.in>',

          to: user.email,

          subject:
            "2FA Verification Code - Agile Insurance",

          text:
            `Your 2FA authentication code is ${otp}. It will expire in 5 minutes.`,

          html:
            `<p>Your 2FA authentication code is <b>${otp}</b>.</p>
             <p>It will expire in 5 minutes.</p>`,
        };


        await transporter.sendMail(
          mailOptions
        );


        return res.status(200).json({
          success: true,

          require2FA: true,

          message:
            "2FA code sent to your email",

          email: user.email,
        });
      }


      const auth =
        buildAuthResponse(user);


      res.cookie(
        "token",
        auth.token,
        getCookieOptions()
      );


      return res.status(200).json({
        success: true,

        require2FA: false,

        message:
          "Login successful",

        data: auth,
      });

    } catch (error) {
      console.error(
        "Login error:",
        error
      );


      return next(
        new AppError(
          error.message ||
            "Failed to login",
          500
        )
      );
    }
  }
);


// ======================================================
// VERIFY USER 2FA
// ======================================================

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

// ======================================================
// FORGOT PASSWORD
// ======================================================

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

// ======================================================
// RESET PASSWORD
// ======================================================

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

// ======================================================
// LOGOUT
// ======================================================

const logout = catchAsync(
  async (req, res) => {

    res.clearCookie(
      "token",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "strict"
            : "lax",
      }
    );


    return res.status(200).json({
      success: true,

      message:
        "Logout successful",
    });
  }
);


// ======================================================
// GET CURRENT USER
// ======================================================

const me = catchAsync(
  async (req, res) => {

    return res.status(200).json({
      success: true,

      data: req.user,
    });
  }
);


// ======================================================
// UPDATE PROFILE
// ======================================================

const updateProfile = catchAsync(
  async (req, res, next) => {

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


    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          updateData[field] =
            req.body[field];
        }
      }
    );


    if (updateData.email) {
      updateData.email =
        updateData.email
          .toLowerCase()
          .trim();
    }


    if (
      req.user.role === "user" &&
      req.body.role &&
      req.body.role !==
        req.user.role
    ) {
      return next(
        new AppError(
          "Forbidden",
          403
        )
      );
    }


    if (
      req.body.role &&
      req.user.role === "admin"
    ) {
      updateData.role =
        req.body.role;
    }


    const duplicateConditions = [];


    if (updateData.email) {
      duplicateConditions.push({
        email: updateData.email,
      });
    }


    if (updateData.phone) {
      duplicateConditions.push({
        phone: updateData.phone,
      });
    }


    if (
      duplicateConditions.length > 0
    ) {
      const duplicate =
        await User.findOne({
          _id: {
            $ne: req.user._id,
          },

          $or:
            duplicateConditions,
        });


      if (duplicate) {
        return next(
          new AppError(
            "Email or phone already exists",
            409
          )
        );
      }
    }


    const user =
      await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");


    if (!user) {
      return next(
        new AppError(
          "User not found",
          404
        )
      );
    }


    return res.status(200).json({
      success: true,

      message:
        "Profile updated successfully",

      data: user,
    });
  }
);


// ======================================================
// CHANGE PASSWORD
// ======================================================

const changePassword = catchAsync(
  async (req, res, next) => {
    const {
      current_password,
      new_password,
    } = req.body;


    if (
      !current_password ||
      !new_password
    ) {
      return next(
        new AppError(
          "Current password and new password are required",
          400
        )
      );
    }


    const user =
      await User.findById(
        req.user._id
      );


    if (!user) {
      return next(
        new AppError(
          "User not found",
          404
        )
      );
    }


    const matched =
      await user.comparePassword(
        current_password
      );


    if (!matched) {
      return next(
        new AppError(
          "Current password is incorrect",
          400
        )
      );
    }


    const samePassword =
      await user.comparePassword(
        new_password
      );


    if (samePassword) {
      return next(
        new AppError(
          "New password must be different from current password",
          400
        )
      );
    }


    user.password =
      new_password;


    await user.save();


    return res.status(200).json({
      success: true,

      message:
        "Password changed successfully",
    });
  }
);


// ======================================================
// GOOGLE OAUTH LOGIN
// ======================================================

const googleOAuthLogin = catchAsync(
  async (req, res, next) => {
    try {
      const {
        idToken,
        accessToken,
      } = req.body;


      let payload;


      if (idToken) {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
        );


        if (!verifyRes.ok) {
          return next(
            new AppError(
              "Invalid Google ID token",
              400
            )
          );
        }


        payload =
          await verifyRes.json();

      } else if (accessToken) {
        const verifyRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          }
        );


        if (!verifyRes.ok) {
          return next(
            new AppError(
              "Invalid Google access token",
              400
            )
          );
        }


        payload =
          await verifyRes.json();

      } else {
        return next(
          new AppError(
            "Google ID token or access token is required",
            400
          )
        );
      }


      if (!payload.email) {
        return next(
          new AppError(
            "Google account email is unavailable",
            400
          )
        );
      }


      const email =
        payload.email
          .toLowerCase()
          .trim();


      let user = await User.findOne({
        email,
      });


      if (!user) {
        const randomPhone =
          `00${Math.floor(
            10000000 +
              Math.random() * 90000000
          )}`;


        user = await User.create({
          fullName:
            payload.name ||
            "Google User",

          email,

          phone:
            randomPhone,

          password:
            `oauth_google_${payload.sub || Date.now()}_${crypto
              .randomBytes(16)
              .toString("hex")}`,

          is_verified: true,

          kyc_status:
            "pending",

          profile_image:
            payload.picture || "",
        });
      }


      const auth =
        buildAuthResponse(user);


      res.cookie(
        "token",
        auth.token,
        getCookieOptions()
      );


      return res.status(200).json({
        success: true,

        message:
          "Google login successful",

        data: auth,
      });

    } catch (error) {
      console.error(
        "Google OAuth error:",
        error
      );


      return next(
        new AppError(
          "Google login failed",
          500
        )
      );
    }
  }
);


// ======================================================
// FACEBOOK OAUTH LOGIN
// ======================================================

const facebookOAuthLogin = catchAsync(
  async (req, res, next) => {
    try {
      const {
        accessToken,
      } = req.body;


      if (!accessToken) {
        return next(
          new AppError(
            "Facebook access token is required",
            400
          )
        );
      }


      const verifyRes = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`
      );


      if (!verifyRes.ok) {
        return next(
          new AppError(
            "Invalid Facebook access token",
            400
          )
        );
      }


      const payload =
        await verifyRes.json();


      if (!payload.id) {
        return next(
          new AppError(
            "Unable to verify Facebook account",
            400
          )
        );
      }


      const email =
        payload.email
          ? payload.email
              .toLowerCase()
              .trim()
          : `${payload.id}@facebook.oauth`;


      let user = await User.findOne({
        email,
      });


      if (!user) {
        const randomPhone =
          `00${Math.floor(
            10000000 +
              Math.random() * 90000000
          )}`;


        user = await User.create({
          fullName:
            payload.name ||
            "Facebook User",

          email,

          phone:
            randomPhone,

          password:
            `oauth_facebook_${payload.id}_${crypto
              .randomBytes(16)
              .toString("hex")}`,

          is_verified: true,

          kyc_status:
            "pending",

          profile_image:
            payload.picture?.data?.url ||
            "",
        });
      }


      const auth =
        buildAuthResponse(user);


      res.cookie(
        "token",
        auth.token,
        getCookieOptions()
      );


      return res.status(200).json({
        success: true,

        message:
          "Facebook login successful",

        data: auth,
      });

    } catch (error) {
      console.error(
        "Facebook OAuth error:",
        error
      );


      return next(
        new AppError(
          "Facebook login failed",
          500
        )
      );
    }
  }
);


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  register,
  verifyRegisterOtp,
  sendVerifyotp,
  verifyUser,
  login,
  verify2FAUser,
  forgotPassword,
  resetPassword,
  logout,
  me,
  updateProfile,
  changePassword,
  googleOAuthLogin,
  facebookOAuthLogin,
};