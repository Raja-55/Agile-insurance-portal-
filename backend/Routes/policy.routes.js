const express = require("express");
const router = express.Router();

const {
  createPolicy,
  updatePolicy,
  deactivatePolicy,
  getAllPoliciesAdmin,
  getAllPolicies,
  getPoliciesByCategory,
  getPolicyById
} =
  require("../Controllers/policy.controller");

const authenticateAdmin = require("../Middlewares/admin.middleware");

// Admin routes (login + admin role required) 
router.post("/admin/create", authenticateAdmin, createPolicy);
router.put("/admin/:id", authenticateAdmin, updatePolicy);
router.delete("/admin/:id", authenticateAdmin, deactivatePolicy);
router.get("/admin/all", authenticateAdmin, getAllPoliciesAdmin);

// ── User / public routes ─────────────────────────────────────────
// NOTE: /category/:category must come before /:id
// otherwise Express reads "category" as a Mongo ObjectId → CastError
router.get("/", getAllPolicies);
router.get("/category/:category", getPoliciesByCategory);
router.get("/:id", getPolicyById);

module.exports = router;

// ── Mount in app.js ──────────────────────────────────────────────
// const policyRoutes = require("./routes/policyRoutes");
// app.use("/api/policies", policyRoutes);
//
// Final URL map:
//   POST   /api/policies/admin/create        → admin creates policy
//   PUT    /api/policies/admin/:id           → admin edits policy
//   DELETE /api/policies/admin/:id           → admin deactivates policy
//   GET    /api/policies/admin/all           → admin sees all policies
//   GET    /api/policies/category/:category  → user browses by type
//   GET    /api/policies/:id                 → user views full detail