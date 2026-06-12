const express = require("express");
const authenticateUser = require("../Middlewares/auth.middleware");
const { createSupportTicket, getSupportTickets } = require("../Controllers/support.controller");

const router = express.Router();

router.use(authenticateUser);
router.get("/tickets", getSupportTickets);
router.post("/tickets", createSupportTicket);

module.exports = router;