const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
    },
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
    transaction_id: {
      type: String,
<<<<<<< HEAD
      unique: true,
      sparse: true,
=======
      required: true,
      unique: true,
      trim: true,
>>>>>>> raj
    },
    invoice_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Base premium amount before tax
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    tax_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
<<<<<<< HEAD
=======
    // amount + tax_amount — the actual amount charged
>>>>>>> raj
    final_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_method: {
<<<<<<< HEAD
      type: String,
      required: true,
    },
    payment_provider: {
      type: String,
      default: "agile-pay",
    },
    payment_status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "success",
    },
    paid_at: {
      type: Date,
      default: Date.now,
    },
    // Compatibility fields
    method: {
=======
>>>>>>> raj
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "autopay"],
    },
    payment_provider: {
      type: String,
      default: "agile-pay",
    },
    payment_status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "success",
    },
    paid_at: {
      type: Date,
      default: Date.now,
    },

    // --- Backward-compatible aliases (older code/UI may read these) ---
    method: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

<<<<<<< HEAD
// Pre-save hook to keep compatibility fields in sync
paymentSchema.pre("save", function () {
  if (this.payment_method && !this.method) {
    const normMethod = this.payment_method.toLowerCase();
    if (normMethod.includes("upi")) this.method = "upi";
    else if (normMethod.includes("card")) this.method = "card";
    else if (normMethod.includes("net")) this.method = "netbanking";
    else if (normMethod.includes("wallet")) this.method = "wallet";
    else this.method = "autopay";
  }
  if (this.payment_status && !this.status) {
    this.status = this.payment_status;
  }
=======
// Keep legacy alias fields in sync so older reads (.method / .status) still work.
paymentSchema.pre("validate", function () {
  if (this.payment_method !== undefined) {
    this.method = this.payment_method;
  }
  if (this.payment_status !== undefined) {
    this.status = this.payment_status;
  }
  if (this.final_amount === undefined && this.amount !== undefined) {
    this.final_amount = this.amount + (this.tax_amount || 0);
  }
>>>>>>> raj
});

module.exports = mongoose.model("Payment", paymentSchema);

