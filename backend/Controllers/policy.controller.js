const Policy = require("../Models/policy.model");

const createPolicy = async (req, res) => {
  try {
    // Ensure route is called by an authenticated admin middleware which attaches `req.admin`
    const admin = req.admin || (req.user && req.user._id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: admin credentials required.",
      });
    }

    const body = req.body || {};
    // normalize input fields (accept both camelCase and snake_case variants)
    const companyName = (body.companyName || body.company_name || "").trim();
    const companyLogo = body.companyLogo || body.company_logo || "";
    const policyName = (
      body.policyName ||
      body.policyName ||
      body.policyName ||
      ""
    ).trim();
    const policyNumber =
      body.policyNumber || body.policyNumber || `POL-${Date.now()}`;
    const policyAmount =
      body.policyAmount || body.premiumAmount || body.monthlyPremium || 0;
    const coverageAmount = body.coverageAmount || body.coverageAmount || 0;
    const category = body.category || "general";
    const policyType =
      body.policyType || body.policyType || body.policyType || "";
    const policy_desc =
      body.policy_desc || body.description || body.policyDesc || "";
    const features = Array.isArray(body.features)
      ? body.features
      : body.features
        ? [body.features]
        : [];
    const emiAvailable =
      body.emiAvailable !== undefined ? Boolean(body.emiAvailable) : false;
    const validityYears = body.validityYears || body.validity_years || 1;
    const rating = body.rating || 0;
    const claimRatio = body.claimRatio || body.claim_ratio || 0;

    if (!companyName || !policyName) {
      return res.status(400).json({
        success: false,
        message: "companyName and policyName are required.",
      });
    }

    // Prevent duplicate policy names under same company
    const duplicate = await Policy.findOne({
      companyName: companyName,
      policyName: policyName,
    });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `${policyName} already exists for ${companyName}.`,
      });
    }

    // Build policy doc matching the Policy schema
    const policyDoc = {
      admin: admin._id || admin,
      companyName,
      companyLogo,
      policyName,
      policyNumber,
      premiumAmount: Number(policyAmount),
      coverageAmount: Number(coverageAmount),
      category,
      policyType: policyType,
      description: policy_desc,
      features,
      emiAvailable,
      validityYears,
      rating,
      claimRatio,
      isActive: true,
    };

    const policy = await Policy.create(policyDoc);

    return res
      .status(201)
      .json({ success: true, message: "Policy created successfully.", policy });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    console.error("[createPolicy]", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

//  ADMIN — Update an existing policy
//  Route  : PUT /api/policies/admin/:id
//  Access : Admin only
const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Policy.findByIdAndUpdate(
      id,
      { $set: req.body }, // only overwrite fields that are sent
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Policy not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Policy updated successfully.",
      policy: updated,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid policy ID." });
    }

    console.error("[updatePolicy]", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

//  ADMIN — Soft-delete (deactivate) a policy
//  Route  : DELETE /api/policies/admin/:id
//  Access : Admin only
//
//  We never hard-delete — existing purchases still reference this
//  policy. Setting isActive = false hides it from users.
const deactivatePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!policy) {
      return res
        .status(404)
        .json({ success: false, message: "Policy not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Policy deactivated successfully.",
      policy,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid policy ID." });
    }
    console.error("[deactivatePolicy]", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const deletePolicy = async (req, res) => {
  try {
    console.log("DELETE CALLED");
    console.log("ID:", req.params.id);

    const policy = await Policy.findByIdAndDelete(
      req.params.id
    );

    console.log("DELETED:", policy);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    console.error(err);
  }
};
// ═══════════════════════════════════════════════════════════════════
//  ADMIN — Get ALL policies (active + inactive) for dashboard
//  Route  : GET /api/policies/admin/all
//  Access : Admin only
// ═══════════════════════════════════════════════════════════════════
const getAllPoliciesAdmin = async (req, res) => {
  try {
    const policies = await Policy.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: policies.length,
      policies,
    });
  } catch (error) {
    console.error("[getAllPoliciesAdmin]", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

//  USER — Get all active policies by category
//  Frontend sends: /api/policies/category/health
// GET /api/policies
// GET /api/policies?category=health

const getPoliciesByCategory = async (req, res) => {
  try {
    // Support category as either query param or path param
    const categoryParam = (
      req.query.category ||
      req.params.category ||
      ""
    ).toString();
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);

    // Build filter — always only active policies
    const filter = { isActive: true };
    if (categoryParam && categoryParam !== "all") {
      filter.category = categoryParam.toLowerCase();
    }

    const skip = (page - 1) * limit;

    const [policies, total] = await Promise.all([
      Policy.find(filter)
        .sort({ createdAt: -1 }) // newest first
        .skip(skip)
        .limit(limit)
        .populate("admin", "fullName email"), // include admin info
      Policy.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: policies.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: policies,
    });
  } catch (error) {
    console.error("[getPoliciesByCategory]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/policies/:id
const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id).populate(
      "admin",
      "name email",
    );

    if (!policy) {
      return res
        .status(404)
        .json({ success: false, message: "Policy not found" });
    }

    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid policy ID" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Admin
  createPolicy,
  updatePolicy,
  deactivatePolicy,
  getAllPoliciesAdmin,
  // User
  deletePolicy,
  getPoliciesByCategory,
  getPolicyById,
};