const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    documentType: {
      type: String,
      enum: [
        "Aadhar",
        "PAN",
        "Driving License",
        "Passport",
        "Policy",
        "Claim",
        "Other",
      ],
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: Number,

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Re-upload Requested",
      ],
      default: "Pending",
    },

    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);