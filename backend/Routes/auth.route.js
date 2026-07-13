const express = require("express");
const {
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
} = require("../Controllers/authUser.controller");

const authenticateUser = require("../Middlewares/auth.middleware");
const { validateRegister, validateLogin, validateUpdateProfile, validateChangePassword } = require("../Middlewares/validation.middleware");

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/google", googleOAuthLogin);
router.post("/facebook", facebookOAuthLogin);
router.post("/logout", authenticateUser, logout);
router.get("/me", authenticateUser, me);
router.put("/update-profile", authenticateUser, validateUpdateProfile, updateProfile);
router.put("/change-password", authenticateUser, validateChangePassword, changePassword);

// OTP, 2FA & Password Reset routes
router.post("/send-otp", sendVerifyotp);
router.post("/verify-otp", verifyUser);
router.post("/verify-register-otp", verifyRegisterOtp);
router.post("/verify-2fa", verify2FAUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
