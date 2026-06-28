const express = require("express");
const router = express.Router();
const authenticateUser = require("../Middlewares/auth.middleware");
const {
  createClaim,
  getMyClaims,
  getClaimById,
  getClaimFormConfig,
} = require("../Controllers/claim.controller");

// All claim routes require a valid user JWT
router.use(authenticateUser);

// GET  /api/claims/form/:purchaseId — get dynamic claim form configuration
router.get("/form/:purchaseId", getClaimFormConfig);

// GET  /api/claims/my  — get all claims for the logged-in user
router.get("/my", getMyClaims);

// GET  /api/claims/:id — get single claim (must belong to user)
router.get("/:id", getClaimById);

// POST /api/claims     — file a new claim
router.post("/", createClaim);

module.exports = router;
