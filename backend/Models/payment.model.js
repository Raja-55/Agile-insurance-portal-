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
      required: true,
      unique: true,
      trim: true,
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
    // amount + tax_amount — the actual amount charged
    final_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_method: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "autopay"],
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

// Keep legacy alias fields in sync so older reads (.method / .status) still work.
paymentSchema.pre("validate", function () {
  if (this.payment_method !== undefined) {
    const normalized = String(this.payment_method).toLowerCase();
    const paymentMethodMap = {
      card: "card",
      cards: "card",
      creditcard: "card",
      debitcard: "card",
      netbanking: "netbanking",
      "netbanking": "netbanking",
      "net-banking": "netbanking",
      upi: "upi",
      wallet: "wallet",
      wallets: "wallet",
      autopay: "autopay",
    };
    this.payment_method = paymentMethodMap[normalized] || normalized;
    this.method = this.payment_method;
  }
  if (this.payment_status !== undefined) {
    this.status = this.payment_status;
  }
  if (this.final_amount === undefined && this.amount !== undefined) {
    this.final_amount = this.amount + (this.tax_amount || 0);
  }
});

module.exports = mongoose.model("Payment", paymentSchema);
