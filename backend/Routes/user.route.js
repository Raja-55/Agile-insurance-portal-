const express = require("express");
const authenticateUser = require("../Middlewares/auth.middleware");
const { getDashboard } = require("../Controllers/user.controller");
const { createKycRequest, getMyKycRequests } = require("../Controllers/kyc.controller");
const { getMyPolicies } = require("../Controllers/purchase.controller");
const { validateKycRequest } = require("../Middlewares/validation.middleware");

const router = express.Router();

// Allow any authenticated user (role "user" or undefined for legacy accounts)
// Admin accounts are blocked via their own separate /api/admin routes
router.use(authenticateUser, (req, res, next) => {
  if (req.user && req.user.role !== "admin") return next();
  return res.status(403).json({ success: false, message: "Forbidden" });
});

router.get("/dashboard", getDashboard);
router.get("/kyc-requests", getMyKycRequests);
router.post("/kyc-requests", validateKycRequest, createKycRequest);
router.get("/my-policies", getMyPolicies);


module.exports = router;



