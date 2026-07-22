const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    purchase_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    nominee: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      relation: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      dob: {
        type: Date,
        required: true,
      },
    },
    purchase_date: {
      type: Date,
      default: Date.now,
    },
    start_date: {
      type: Date,
      default: Date.now,
    },
    end_date: {
      type: Date,
      required: true,
    },
    remaining_months: {
      type: Number,
      required: true,
      min: 0,
    },
    purchase_status: {
      type: String,
      enum: ["active", "pending", "cancelled", "expired"],
      default: "active",
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "paid",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate purchase_number if not provided (fallback)
purchaseSchema.pre("validate", async function () {
  if (!this.purchase_number) {
    const rand1 = Math.floor(100000 + Math.random() * 900000);
    const rand2 = Math.floor(1000 + Math.random() * 9000);
    this.purchase_number = `AGL-PUR-${rand1}-${rand2}`;
  }
});

<<<<<<< HEAD
module.exports = mongoose.model("Purchase", purchaseSchema);
=======
module.exports = mongoose.model("Purchase", purchaseSchema);
>>>>>>> raj
