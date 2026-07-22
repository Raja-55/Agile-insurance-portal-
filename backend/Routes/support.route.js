const express = require("express");
const authenticateUser = require("../Middlewares/auth.middleware");
const {
  createSupportTicket,
  getSupportTickets,
  replyToSupportTicketUser,
} = require("../Controllers/support.controller");

const router = express.Router();

router.use(authenticateUser);

// User creates ticket
router.post("/support-tickets", authenticateUser, createSupportTicket);
// User sees own tickets
// router.get("/tickets", getSupportTickets);
router.get("/support-tickets", authenticateUser, getSupportTickets);
// User replies to their own ticket
router.post("/support-tickets/:id/messages", authenticateUser, replyToSupportTicketUser);
module.exports = router;