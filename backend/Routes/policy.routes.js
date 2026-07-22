const express = require("express");
const router = express.Router();

const {
  createPolicy,
  updatePolicy,
  deactivatePolicy,
  getAllPoliciesAdmin,
  getAllPolicies,
  getPoliciesByCategory,
<<<<<<< HEAD
  getPolicyById
} =
  require("../Controllers/policy.controller");
=======
  getPolicyById,
  deletePolicy,
} = require("../Controllers/policy.controller");
>>>>>>> raj

const authenticateAdmin = require("../Middlewares/admin.middleware");

// Admin routes (login + admin role required) 
router.post("/admin/create", authenticateAdmin, createPolicy);
router.put("/admin/:id", authenticateAdmin, updatePolicy);
router.delete("/admin/:id", authenticateAdmin, deactivatePolicy);
router.get("/admin/all", authenticateAdmin, getAllPoliciesAdmin);

// ── User / public routes ─────────────────────────────────────────
<<<<<<< HEAD
// NOTE: /category/:category must come before /:id
// otherwise Express reads "category" as a Mongo ObjectId → CastError
router.get("/", getAllPolicies);
=======

router.get("/", getPoliciesByCategory);
>>>>>>> raj
router.get("/category/:category", getPoliciesByCategory);
router.get("/:id", getPolicyById);

module.exports = router;

