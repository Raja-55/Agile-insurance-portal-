const express = require("express");
const router = express.Router();


const authenticateAdmin = require("../Middlewares/admin.middleware");

const { getAllSupportTickets, replySupportTicket, resolveTicket } = require("../Controllers/adminSupport.controller");

router.use(authenticateAdmin);

router.get("/support-tickets", getAllSupportTickets);      
router.post("/support-tickets/:id/messages", replySupportTicket);
router.patch("/support-tickets/:id", resolveTicket);       

module.exports = router;