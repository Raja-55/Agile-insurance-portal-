const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: {
      type: String,
      enum: [
        "Policy support",
        "Claim issue",
        "Payment issue",
        "Document verification",
        "Complaint",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    // Add this section
    messages: [
      {
        sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
},

senderRole: {
    type: String,
    enum: ["user", "admin"],
    required: true,
},

        text: {
          type: String,
          required: true,
          trim: true,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SupportTicket",
  supportTicketSchema
);