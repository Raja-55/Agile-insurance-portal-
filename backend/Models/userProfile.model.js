const mongoose = require("mongoose");

const familyMemberSchema = new mongoose.Schema(
  {
    name: { 
        type: String,
        required: true,
        trim: true
     },
    relation: {
      type: String,
      enum: ["Spouse", "Parent", "Child", "Sibling", "Other"],
      default: "Other",
    },
    
    dateOfBirth: { type: Date, default: null },
    phone: { type: String, default: "" },
    notes: { type: String, default: "" },
    isNominee: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const userProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    full_name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    profile_photo: { type: String, default: "" },
    familyMembers: [familyMemberSchema],
    nominee: {
      name: { type: String, default: "" },
      relation: { type: String, default: "Other" },
      percentage: { type: Number, default: 100 },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UserProfile", userProfileSchema);