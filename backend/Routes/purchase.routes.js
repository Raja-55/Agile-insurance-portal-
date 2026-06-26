const express = require("express");
const router = express.Router();
const { createPurchase } = require("../Controllers/purchase.controller");
const authenticateUser = require("../Middlewares/auth.middleware");

// Protect all routes in this router
router.use(authenticateUser);

router.post("/", createPurchase);

module.exports = router;
