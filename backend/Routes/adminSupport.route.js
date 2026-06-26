const express = require("express");
const router = express.Router();


const authenticateAdmin = require("../Middlewares/admin.middleware");

const {
    // getAllSupportTickets,
    replySupportTicket
} = require("../Controllers/adminSupport.controller");

router.use(authenticateAdmin);

// Admin sees all tickets
// router.get("/support-tickets", getAllSupportTickets);

// Admin replies
router.post(
    "/support-tickets/:id/messages",
    replySupportTicket
);

module.exports = router;