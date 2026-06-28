const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },
    claim_number: {
      type: String,
      required: true,
      unique: true,
    },
    claim_type: {
      type: String,
      required: true,
      trim: true,
    },
    claim_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "approved", "rejected"],
      default: "pending",
    },
    ai_status: {
      type: String,
      enum: ["pending", "verified", "flagged"],
      default: "pending",
    },
    category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InsuranceCategory",
    required: true
  },

  companyName: {
    type: String,
    required: true
  },

  companyLogo: String,

  policyName: {
    type: String,
    required: true
  },

  monthlyPremium: Number,

  coverageAmount: Number,

  claimRatio: Number,

  validityYears: Number,

  rating: Number,

  emiAvailable: {
    type: Boolean,
    default: false
  },

  policyType: String,

  features: [{
    type: String
  }],

  description: String,

  isActive: {
    type: Boolean,
    default: true
  }
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Claim", claimSchema);
