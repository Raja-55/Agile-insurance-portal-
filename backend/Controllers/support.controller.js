const SupportTicket = require("../Models/contact.model");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");

const createSupportTicket = catchAsync(async (req, res, next) => {
  const { subject, message, priority = "Medium" } = req.body;

  if (!subject || !message || !String(message).trim()) {
    return next(new AppError("Subject and message are required.", 400));
  }

  const ticket = await SupportTicket.create({
    user: req.user._id,
    subject,
    priority,
    status: "Open",
    messages: [
      {
        sender: req.user._id,
        senderRole: "user",
        text: String(message).trim(),
        createdAt: new Date(),
      },
    ],
  });
  console.log("req.user:", req.user);
console.log("req.user._id:", req.user?._id);
  const ticketWithUser = await SupportTicket.findById(ticket._id)
    .populate("user", "fullName email")
    .populate("assignedAdmin", "fullName email");

  res.status(201).json({
    success: true,
    message: "Support ticket created successfully.",
    data: ticketWithUser,
  });
});

const getSupportTickets = catchAsync(async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("user", "fullName email")
    .populate("assignedAdmin", "fullName email");

  res.status(200).json({
    success: true,
    data: tickets,
  });
});

// POST /api/support/support-tickets/:id/messages
// Logged-in user sends a follow-up message on their own ticket.
const replyToSupportTicketUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { text, message } = req.body;
  const messageText = (text || message || "").trim();

  if (!messageText) {
    return next(new AppError("Message text is required.", 400));
  }

  const ticket = await SupportTicket.findOne({ _id: id, user: req.user._id });
  if (!ticket) {
    return next(new AppError("Support ticket not found.", 404));
  }

  ticket.messages.push({
    sender: req.user._id,
    senderRole: "user",
    text: messageText,
    createdAt: new Date(),
  });

  // Re-opening the ticket on a fresh user reply if it was already resolved.
  if (ticket.status === "Resolved") {
    ticket.status = "In Progress";
  }

  await ticket.save();

  const updatedTicket = await SupportTicket.findById(ticket._id)
    .populate("user", "fullName email")
    .populate("assignedAdmin", "fullName email");

  res.status(200).json({
    success: true,
    data: updatedTicket,
  });
});

module.exports = {
  createSupportTicket,
  getSupportTickets,
  replyToSupportTicketUser,
};
