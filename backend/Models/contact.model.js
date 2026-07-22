const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    ticket_number: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
    },

    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

<<<<<<< HEAD
    claim: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "Claim",
      default: null,
=======
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
>>>>>>> raj
    },

    subject: {
      type:     String,
      required: true,
      trim:     true,
    },

    message: {
      type: String,
      trim: true,
    },

    priority: {
      type:    String,
      enum:    ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type:    String,
      enum:    ["open", "in_progress", "resolved", "closed", "Open", "In Progress", "Resolved"],
      default: "open",
    },

    attachments: [
      {
        type: String, // URLs or file names
      },
    ],

    assignedAdmin: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "User",
      default: null,
    },

    // Retained messages array for backward compatibility with the existing chat component
    messages: [
      {
        sender: {
<<<<<<< HEAD
          type:     mongoose.Schema.Types.ObjectId,
          ref:      "User",
          required: true,
        },

        senderRole: {
          type:     String,
          enum:     ["user", "admin"],
          required: true,
        },
=======
    type: mongoose.Schema.Types.ObjectId,
    required: true,
},

senderRole: {
    type: String,
    enum: ["user", "admin"],
    required: true,
},
>>>>>>> raj

        text: {
          type:     String,
          required: true,
          trim:     true,
        },

        createdAt: {
          type:    Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook: generate ticket_number and normalize status
supportTicketSchema.pre("validate", async function () {
  if (!this.ticket_number) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.ticket_number = `TKT-${rand}`;
  }

  // Handle message field synchronisation to messages list
  if (this.message && (!this.messages || this.messages.length === 0)) {
    this.messages = [
      {
        sender:     this.user,
        senderRole: "user",
        text:       this.message,
        createdAt:  new Date(),
      },
    ];
  }
});

module.exports = mongoose.model("SupportTicket", supportTicketSchema);