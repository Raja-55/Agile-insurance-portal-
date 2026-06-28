const express = require("express");
const router = express.Router();
const authenticateUser = require("../Middlewares/auth.middleware");
const authenticateAdmin = require("../Middlewares/admin.middleware");
const {
  createSupportTicket,
  getUserSupportTickets,
  getAdminSupportTickets,
  updateAdminSupportTicket,
  replyToSupportTicket,
} = require("../Controllers/supportTicket.controller");

// User routes
router.post("/claim-support", authenticateUser, createSupportTicket);
router.get("/user/support", authenticateUser, getUserSupportTickets);
router.post("/support-tickets/:id/messages", authenticateUser, replyToSupportTicket);

// Admin routes
router.get("/admin/support", authenticateAdmin, getAdminSupportTickets);
router.patch("/admin/support/:id", authenticateAdmin, updateAdminSupportTicket);

module.exports = router;
