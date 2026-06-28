const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../Middlewares/admin.middleware");

const {
  getDashboard,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  // getAgents,
  getPolicies,
  getClaims,
  getPayments,
  getKycRequests,
  getSystemSettings,
  updateSystemSettings,
  createAuditLog,
  getAuditLogs,
  reviewKyc,
  updateClaim,
  deleteClaim,
  getSupportTicketsAdmin,
  updateSupportTicket,
  
} = require("../Controllers/admin.controller");


const {registerAdmin, loginAdmin} = require("../Controllers/authAdmin.controller")


router.post("/auth/register", registerAdmin);
router.post("/auth/login", loginAdmin);
router.get("/settings", getSystemSettings);
router.use(authenticateAdmin);
router.patch("/settings", updateSystemSettings);

router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/policies", getPolicies);


router.get("/claims", getClaims);
router.patch("/claims/:id", updateClaim);
router.delete("/claims/:id", deleteClaim);
// router.get("/agents", getAgents);
router.get("/payments", getPayments);
router.get("/kyc-requests", getKycRequests);
router.patch("/kyc-requests/:id", reviewKyc);
router.get("/audit-logs", getAuditLogs);
router.post("/audit-logs", createAuditLog);
router.get("/support-tickets", getSupportTicketsAdmin);
router.patch("/support-tickets/:id", updateSupportTicket);
// router.post("/support-tickets/:id/messages", replyToSupportTicket);

module.exports = router;