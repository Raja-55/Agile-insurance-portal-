const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["document", "claim", "support", "system"],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    // Free-form extra data, e.g. { documentId, claimId, ticketId, status }
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false },
    smsStatus: {
      type: String,
      enum: ["sent", "failed", "skipped", "not_attempted"],
      default: "not_attempted",
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);