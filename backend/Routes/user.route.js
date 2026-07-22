const express = require("express");
const authenticateUser = require("../Middlewares/auth.middleware");
const authorizeRoles = require("../Middlewares/role.middleware");
const { getDashboard } = require("../Controllers/user.controller");
const { createKycRequest, getMyKycRequests } = require("../Controllers/kyc.controller");
const { validateKycRequest } = require("../Middlewares/validation.middleware");
const { getMyClaims, getClaimById } = require("../Controllers/claim.controller");
const { getMyPolicies } = require("../Controllers/purchase.controller");

const router = express.Router();

router.use(authenticateUser, authorizeRoles("user"));

router.get("/dashboard", getDashboard);
router.get("/kyc-requests", getMyKycRequests);
router.post("/kyc-requests", validateKycRequest, createKycRequest);
router.post("/user/dashboard", getDashboard); // Added POST route for dashboard data refresh

router.get("/purchases", getMyPolicies);
router.get("/claims", getMyClaims);
router.get("/claims/:id", getClaimById);

module.exports = router;



