const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
},
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  companyLogo: {
      type: String, // URL to logo image
      default: '',
    },
    policyName: {
      type: String,
      required: [true, 'Policy name is required'],
      trim: true,
    },
     monthlyPremium: Number,

  validityYears: {
      type: Number,
      default: 1,
      min: 1,
    },
    rating: {
      type: Number,
      default: 4.0,
      min: 0,
      max: 5,
    },
    claimRatio: {
      type: Number,
      default: 95,
      min: 0,
      max: 100,
      // percentage, e.g. 98.5 means 98.5%
    },
    sales: {
  totalSales: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
  monthly: {
    type: [Number],
    default: [0,0,0,0,0,0],
  },
},

    claim:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Claim",
      required:false,
      index:true,
    },
    
    emiAvailable: {
    type: Boolean,
    default: false
  },

  policyType: {
      type: String,
      required: [true, 'Policy type is required'],
      trim: true,
    },

  features: {
      type: [String],
      default: [],
    },

  description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
  category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['health', 'auto', 'term', 'life', 'travel', 'business'],
      lowercase: true,
    },
  isActive: {
    type: Boolean,
    default: true
  },
    policyNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    premiumAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    coverageAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "expired", "pending", "cancelled"],
      default: "active",
    },
    start_date: {
      type: Date,
      default: Date.now,
    },
    end_date: {
      type: Date,
    },
  },
  {
    timestamps: true,
    
  },
);

// Auto-generate policyNumber before first save
policySchema.pre('save', function () {
  if (!this.policyNumber) {
    const rand1 = Math.floor(100000 + Math.random() * 900000);
    const rand2 = Math.floor(1000 + Math.random() * 9000);
    this.policyNumber = `AGL-${rand1}-${rand2}`;
  }
});

// Full-text search index on these fields
policySchema.index({ policyName: 'text', companyName: 'text', description: 'text' });

module.exports = mongoose.model('Policy', policySchema);