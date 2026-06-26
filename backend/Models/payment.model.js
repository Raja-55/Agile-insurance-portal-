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
      unique: true,
      sparse: true,
    },
    invoice_number: {
      type: String,
      required: true,
      unique: true,
    },
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
    final_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_method: {
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
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "autopay"],
    },
    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "success",
    },
  },
  {
    timestamps: true,
  },
);

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
});

module.exports = mongoose.model("Payment", paymentSchema);

