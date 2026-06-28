const Claim = require("../Models/claim.model");
const Purchase = require("../Models/purchase.model");
const Policy = require("../Models/policy.model");
const AppError = require("../Utils/appError");
const catchAsync = require("../Utils/catchAsync");

/**
 * Helper to get fields list based on policy category
 */
const getClaimFormFields = (category) => {
  const normalized = String(category).toLowerCase();
  
  if (normalized.includes("health") || normalized.includes("medical")) {
    return [
      { name: "hospitalName", label: "Hospital Name", type: "text", required: true },
      { name: "doctor", label: "Attending Doctor", type: "text", required: true },
      { name: "admissionDate", label: "Admission Date", type: "date", required: true },
    ];
  } else if (
    normalized.includes("auto") ||
    normalized.includes("car") ||
    normalized.includes("vehicle")
  ) {
    return [
      { name: "vehicleNumber", label: "Vehicle Number", type: "text", required: true },
      { name: "accidentDate", label: "Incident / Accident Date", type: "date", required: true },
      { name: "damageDescription", label: "Damage Description", type: "textarea", required: true },
    ];
  } else if (normalized.includes("travel") || normalized.includes("trip")) {
    return [
      { name: "destination", label: "Destination", type: "text", required: true },
      { name: "tripDate", label: "Trip Date", type: "date", required: true },
    ];
  } else if (normalized.includes("life") || normalized.includes("term")) {
    return [
      { name: "nomineeRelation", label: "Relation with Nominee", type: "text", required: true },
      { name: "incidentDetails", label: "Death / Loss Details", type: "textarea", required: true },
    ];
  } else {
    return [
      { name: "incidentDetails", label: "Incident Details", type: "textarea", required: true },
    ];
  }
};

/**
 * GET /api/claims/form/:purchaseId
 * Returns dynamic form configuration depending on purchased policy category
 */
const getClaimFormConfig = catchAsync(async (req, res, next) => {
  const { purchaseId } = req.params;

  const purchase = await Purchase.findById(purchaseId).populate("policy");
  if (!purchase) {
    return next(new AppError("Purchase record not found", 404));
  }

  // Detect policy category
  const category = purchase.policy ? purchase.policy.category : "health";
  const fields = getClaimFormFields(category);

  res.status(200).json({
    success: true,
    data: {
      category,
      fields,
    },
  });
});

/**
 * POST /api/claims
 * User submits a new claim request
 */
const createClaim = catchAsync(async (req, res, next) => {
  const {
    purchaseId,
    claim_type,
    claim_reason,
    claim_amount,
    claim_data,
    doc_name,
    documents, // Optional array of document objects
  } = req.body;

  // 1. Authenticate & Verify Purchase
  if (!purchaseId) {
    return next(new AppError("Purchase ID is required", 400));
  }

  const purchase = await Purchase.findOne({
    _id:  purchaseId,
    user: req.user._id,
  }).populate("policy");

  if (!purchase) {
    return next(new AppError("You do not own this purchase policy or it does not exist.", 403));
  }

  const policy = purchase.policy;
  if (!policy) {
    return next(new AppError("Policy details associated with purchase not found", 404));
  }

  // 2. Validate input fields
  const typeOfClaim = claim_type || policy.category || "Health";
  const amountOfClaim = claim_amount || policy.premium_amount || policy.premiumAmount || 0;

  if (Number(amountOfClaim) <= 0) {
    return next(new AppError("A valid claim amount is required.", 400));
  }

  // Validate dynamic fields based on policy category
  const expectedFields = getClaimFormFields(policy.category);
  const data = claim_data || {};
  for (const f of expectedFields) {
    if (f.required && !data[f.name]) {
      return next(new AppError(`Field '${f.label}' is required for this claim.`, 400));
    }
  }

  // 3. Document details (build documents array)
  const docsList = [];
  if (doc_name) {
    docsList.push({
      file_url:      doc_name,
      document_type: "proof_of_loss",
      uploaded_by:   req.user._id,
    });
  }
  if (Array.isArray(documents)) {
    documents.forEach((d) => {
      if (d.file_url) {
        docsList.push({
          file_url:      d.file_url,
          document_type: d.document_type || "other",
          uploaded_by:   req.user._id,
        });
      }
    });
  }

  // 4. Generate Claim and Save
  const now = new Date();
  const claim = await Claim.create({
    user:          req.user._id,
    purchase:      purchase._id,
    policy:        policy._id,
    claim_type:    typeOfClaim,
    claim_reason:  claim_reason || data.damageDescription || data.incidentDetails || "Claim submission",
    claim_amount:  Number(amountOfClaim),
    claim_status:  "submitted",
    claim_data:    data,
    documents:     docsList,
    submitted_at:  now,
    location:      data.hospitalName || data.location || "Not specified",
    doc_name:      doc_name || (docsList[0] ? docsList[0].file_url : ""),
    timeline: [
      { at: now, label: "Claim filed successfully" },
      { at: now, label: "Documents uploaded and received" },
      { at: now, label: "Queued for automated verification" },
    ],
  });

  res.status(201).json({
    success:     true,
    message:     "Claim submitted successfully.",
    claimNumber: claim.claim_number,
    data:        claim,
  });
});

/**
 * GET /api/user/claims
 * Returns claims for currently logged-in user
 */
const getMyClaims = catchAsync(async (req, res) => {
  const claims = await Claim.find({ user: req.user._id })
    .populate("policy", "policyName category companyName")
    .populate("purchase")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data:    claims,
  });
});

/**
 * GET /api/user/claims/:id
 * Return claim details (must own the claim)
 */
const getClaimById = catchAsync(async (req, res, next) => {
  const claim = await Claim.findOne({
    _id:  req.params.id,
    user: req.user._id,
  })
    .populate("policy", "policyName category companyName")
    .populate("purchase");

  if (!claim) {
    return next(new AppError("Claim not found or you are not authorized to view it.", 404));
  }

  res.status(200).json({
    success: true,
    data:    claim,
  });
});

module.exports = {
  getClaimFormConfig,
  createClaim,
  getMyClaims,
  getClaimById,
};