const express = require("express");
const router = express.Router();
const { createPurchase, getMyPolicies } = require("../Controllers/purchase.controller");
const authenticateUser = require("../Middlewares/auth.middleware");

// Protect all routes in this router
router.use(authenticateUser);

// GET  /api/purchases/my  — user's own purchased policies
router.get("/my", getMyPolicies);

// POST /api/purchases     — create a new purchase / payment
router.post("/", createPurchase);

module.exports = router;
