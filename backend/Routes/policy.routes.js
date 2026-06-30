const express = require("express");
const router  = express.Router();

const {
  createPolicy,
  updatePolicy,
  deactivatePolicy,
  getAllPoliciesAdmin,
  getPoliciesByCategory,
  getPolicyById,
  deletePolicy,
} = require("../Controllers/policy.controller");

const authenticateAdmin = require("../Middlewares/admin.middleware");

// Admin routes (login + admin role required) 
router.post  ("/admin/create",   authenticateAdmin, createPolicy);
router.put   ("/admin/:id",      authenticateAdmin, updatePolicy);
// router.delete("/admin/:id",      authenticateAdmin, deactivatePolicy);
router.delete("/admin/:id",      authenticateAdmin, deletePolicy);
router.get   ("/admin/all",      authenticateAdmin, getAllPoliciesAdmin);

// ── User / public routes ─────────────────────────────────────────

router.get("/", getPoliciesByCategory);
router.get("/category/:category", getPoliciesByCategory);
router.get("/:id",                getPolicyById);

module.exports = router;

