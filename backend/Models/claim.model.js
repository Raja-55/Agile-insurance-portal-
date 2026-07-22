const mongoose = require("mongoose");

const timelineEntrySchema = new mongoose.Schema(
  {
    at:    { type: Date,   default: Date.now },
    label: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    file_url:      { type: String, required: true },
    document_type: { type: String, default: "other" },
    uploaded_by:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, _id: false }
);

const claimSchema = new mongoose.Schema(
  {
    // Unique generated claim identifier
    claim_number: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
    },

    // Reference to user
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    // Reference to user purchase
    purchase: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Purchase",
      required: true,
    },

    // Reference to policy
    policy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Policy",
      required: true,
    },

    // "Health", "Car", "Life", "Travel", "Home", "Business"
    claim_type: {
      type:     String,
      required: true,
      trim:     true,
    },

    claim_reason: {
      type: String,
      trim: true,
    },

    claim_amount: {
      type:     Number,
      required: true,
      min:      0,
    },

    claim_status: {
      type:    String,
      enum:    ["draft", "submitted", "reviewing", "approved", "rejected"],
      default: "submitted",
    },

    // Flexible dynamic fields configuration
    claim_data: {
      type:    mongoose.Schema.Types.Mixed,
      default: {},
    },

    // List of documents uploaded
    documents: [documentSchema],

    submitted_at: {
      type:    Date,
      default: Date.now,
    },

    reviewed_at: {
      type: Date,
    },

    admin_review: {
      type: String,
      default: "",
    },

    // --- Backward Compatibility Aliases & Fields ---
    amount: {
      type: Number,
      min:  0,
    },
    status: {
      type:    String,
      enum:    ["pending", "reviewing", "approved", "rejected"],
      default: "pending",
    },
    ai_status: {
      type:    String,
      enum:    ["pending", "verified", "flagged"],
      default: "pending",
    },
    notes: {
      type:    String,
      default: "",
    },
    location: {
      type:    String,
      default: "Not specified",
    },
    doc_name: {
      type:    String,
      default: "",
    },
    timeline: [timelineEntrySchema],
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook: generate claim_number and sync compatibility fields
claimSchema.pre("validate", async function () {
  if (!this.claim_number) {
    const rand1 = Math.floor(100000 + Math.random() * 900000);
    const rand2 = Math.floor(1000 + Math.random() * 9000);
    this.claim_number = `CLM-${rand1}-${rand2}`;
  }

  // Synchronise primary fields to compatibility fields
  if (this.claim_amount !== undefined) {
    this.amount = this.claim_amount;
  }
  if (this.claim_status !== undefined) {
    // Map claim_status enums to status enums
    if (this.claim_status === "submitted") {
      this.status = "pending";
    } else {
      this.status = this.claim_status;
    }
  }
  if (this.admin_review !== undefined) {
    this.notes = this.admin_review;
  }
});

<<<<<<< HEAD
module.exports = mongoose.model("Claim", claimSchema);
=======
module.exports = mongoose.model("Claim", claimSchema);
>>>>>>> raj
