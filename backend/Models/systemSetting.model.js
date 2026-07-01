const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
    {
        //  General Settings
        companyName: {type: String, default: "Agile Insurance"},
        supportEmail:{type: String, default:"support@agileinsurance.com"},
        supportPhone:{type:String, default:"+91 98765 43210"},
        serviceTaxRate: {type: Number, default: 0},

        // Logo and Favicon
        logoUrl: {type: String, default: ""},
        faviconUrl: {type: String, default: ""},
        brandColors: {
            primary: {type: String, default: "#007bff"},
            secondary: {type: String, default: "#6c757d"},
        },

        //  System Configuration
        modules: {
            claimsModule:{type: Boolean, default: true},
            paymentsModule: {type: Boolean, default: true},
            documentModule: {type:Boolean, default: true},
            supportModule:{ type: Boolean, default:true},
        },

        //  Notification Setting
        notifications: {
            emailEnabled: { type: Boolean, default: true },
            smsEnabled: { type: Boolean, default: true },
            pushEnabled: { type: Boolean, default: false },
            renewalReminderDays: { type: Number, default: 15 },
    },
        // Payment Gateways
        paymentGateways:{
            netBanking:{ type: Boolean, default: true},
            upi: {type: Boolean, default: true},
            cards:{type: Boolean, default: true},
            wallets:{type: Boolean, default: true},
            minimumPayment: {type: Number, default: 500},
        },

// Withdrawals Methods
    withdrawalMethods: {
      bankTransfer: { type: Boolean, default: true },
      upiPayout: { type: Boolean, default: false },
      minWithdrawal: { type: Number, default: 100 },
      payoutInstructions: { type: String, default: "Verify bank details before approving payouts." },
    },


    // Policy Forms
    // Policy Forms
policyForms: {
  healthForm: { type: Boolean, default: true },
  motorForm: { type: Boolean, default: true },
  lifeForm: { type: Boolean, default: true },
  travelForm: { type: Boolean, default: true },
  businessForm: { type: Boolean, default: true },
  requiredFields: {
    type: [String],
    default: ["fullName", "email", "phone", "dob", "gender", "address"],
  },
},

    //   Manage Features
    features: {
      aiAssistant: { type: Boolean, default: true },
      policyCompare: { type: Boolean, default: true },
      claimTracking: { type: Boolean, default: true }, 
        
    },


    // Policy Regulations
    regulations: {
        coveredItems: { type: [String], default: ["Hospitalization", "accident damage", "policy benefits", "verified expenses"] },
        excludedItems: { type: [String], default: ["pre-existing conditions", "cosmetic procedures", "unverified claims", "Fraudulent claims", "expired policies", "missing documents"] },
        highValueReviewAmount: { type: Number, default: 100000 },
    },  


  
    frontend: {
        homeHeroTitle: {
      type: String,
      default: "Smart Insurance for Every Need",
    },
    },
pages: {
  aboutPage: {
    type: Boolean,
    default: true,
  },

  contactPage: {
    type: Boolean,
    default: true,
  },

  articlesPage: {
    type: Boolean,
    default: true,
  },

  generalInsurancePage: {
    type: Boolean,
    default: true,
  },

  lifeInsurancePage: {
    type: Boolean,
    default: true,
  },

  termInsurancePage: {
    type: Boolean,
    default: true,
  },

  investmentPage: {
    type: Boolean,
    default: true,
  },

  healthInsurancePage: {
    type: Boolean,
    default: true,
  },

  otherInsurancePage: {
    type: Boolean,
    default: true,
  },

  reviewsPage: {
    type: Boolean,
    default: true,
  },

  companiesPage: {
    type: Boolean,
    default: true,
  },

  newsroomPage: {
    type: Boolean,
    default: true,
  },

  awardsPage: {
    type: Boolean,
    default: true,
  },

  careersPage: {
    type: Boolean,
    default: true,
  },

  legalPoliciesPage: {
    type: Boolean,
    default: true,
  },

  pageNotice: {
    type: String,
    default: "Static pages are managed by the admin team.",
  },
  
  premiumCalculator: {
    type: Boolean,
    default: true,
  },

  termCalculator: {
    type: Boolean,
    default: true,
  },

  emiCalculator: {
    type: Boolean,
    default: true,
  },

  carCalculator: {
    type: Boolean,
    default: true,
  },

},

// KYC Setting
kyc: {
    aadhaarRequired: {
      type: Boolean,
      default: true,
    },

    panRequired: {
      type: Boolean,
      default: true,
    },

    selfieRequired: {
      type: Boolean,
      default: false,
    },

    autoRejectIncompleteKYC: {
      type: Boolean,
      default: false,
    },
},
// Social Login Settings
socialLogin: {
  googleLogin: {
    type: Boolean,
    default: true,
  },

  facebookLogin: {
    type: Boolean,
    default: false,
  },
},

// Language Settings
language: {
  defaultLanguage: {
    type: String,
    default: "English",
  },

  enableMultiLanguage: {
    type: Boolean,
    default: false,
  },

},

// Extensions Settings
extensions: {
  analyticsExtension: {
    type: Boolean,
    default: true,
  },

  chatbotExtension: {
    type: Boolean,
    default: true,
  },

  documentScanner: {
    type: Boolean,
    default: false,
  },
},

// Maintenance Mode
maintenanceMode: {
  enabled: {
    type: Boolean,
    default: false,
  },

  message: {
    type: String,
    default:
      "The portal is temporarily under maintenance. Please check back soon.",
  },
},

// GDPR Cookie Settings
gdprCookie: {
  bannerEnabled: {
    type: Boolean,
    default: true,
  },

  cookieMessage: {
    type: String,
    default:
      "We use cookies to improve your insurance portal experience.",
  },
},
    primaryCTA: {
      type: String,
      default: "Explore Policies",
    },

    showTestimonials: {
      type: Boolean,
      default: true,
    },

  
    },
    {
      timestamps: true,
      strict: false,
    }
);

module.exports = mongoose.model("SystemSetting", systemSettingsSchema);