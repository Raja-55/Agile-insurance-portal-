const mongoose = require("mongoose");

const tempOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // Automatically delete document when expiresAt is reached
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("TempOtp", tempOtpSchema);
