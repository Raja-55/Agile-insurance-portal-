const express = require("express");
const authenticateUser = require("../Middlewares/auth.middleware");
const authorizeRoles = require("../Middlewares/role.middleware");

const {
  getDashboard,
  getUsers,
  getAgents,
  getPolicies,
  getClaims,
  getPayments,
  getKycRequests,
  getSystemSettings,
  updateSystemSettings,
  createAuditLog,
  getAuditLogs,
  reviewKyc,
} = require("../Controllers/admin.controller");

const router = express.Router();

// Public
router.get("/settings", getSystemSettings);

// Protected Admin Routes

router.patch("/settings", updateSystemSettings);

router.use(authenticateUser, authorizeRoles("admin"));
router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.get("/claims", getClaims);
router.get("/policies", getPolicies);
router.get("/agents", getAgents);
router.get("/payments", getPayments);
router.get("/kyc-requests", getKycRequests);
router.get("/audit-logs", getAuditLogs);
router.post("/audit-logs", createAuditLog);
router.patch("/kyc-requests/:id", reviewKyc);

module.exports = router;