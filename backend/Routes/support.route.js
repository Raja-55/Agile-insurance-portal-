const express = require("express");
const authenticateUser = require("../Middlewares/auth.middleware");
const {
  createSupportTicket,
  getSupportTickets,
} = require("../Controllers/support.controller");

const router = express.Router();

router.use(authenticateUser);

// User creates ticket
router.post("/support-tickets", authenticateUser, createSupportTicket);
// User sees own tickets
// router.get("/tickets", getSupportTickets);
router.get("/support-tickets", authenticateUser, getSupportTickets);
module.exports = router;