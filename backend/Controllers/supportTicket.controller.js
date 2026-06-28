const SupportTicket = require("../Models/contact.model");
const Claim = require("../Models/claim.model");
const AppError = require("../Utils/appError");
const catchAsync = require("../Utils/catchAsync");

/**
 * POST /api/claim-support
 * User raises a support ticket
 */
const createSupportTicket = catchAsync(async (req, res, next) => {
  const { subject, message, priority = "Medium", claimId, attachments = [] } = req.body;

  if (!subject || !message || !String(message).trim()) {
    return next(new AppError("Subject and message are required.", 400));
  }

  // Check if claim exists if provided
  let claimDoc = null;
  if (claimId) {
    claimDoc = await Claim.findById(claimId);
  }

  const ticket = await SupportTicket.create({
    user: req.user._id,
    subject,
    priority,
    message: String(message).trim(),
    claim: claimDoc ? claimDoc._id : null,
    attachments: Array.isArray(attachments) ? attachments : [attachments].filter(Boolean),
    status: "open",
    messages: [
      {
        sender: req.user._id,
        senderRole: "user",
        text: String(message).trim(),
        createdAt: new Date(),
      },
    ],
  });

  const populatedTicket = await SupportTicket.findById(ticket._id)
    .populate("user", "fullName email phone")
    .populate("claim", "claim_number claim_type amount");

  res.status(201).json({
    success: true,
    message: "Support ticket created successfully.",
    ticketNumber: ticket.ticket_number,
    data: populatedTicket,
  });
});

/**
 * GET /api/user/support
 * User retrieves their own support tickets
 */
const getUserSupportTickets = catchAsync(async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user._id })
    .populate("user", "fullName email phone")
    .populate("claim", "claim_number claim_type amount")
    .populate("messages.sender", "fullName email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: tickets,
  });
});

/**
 * GET /api/admin/support
 * Admin retrieves all support tickets
 */
const getAdminSupportTickets = catchAsync(async (req, res) => {
  const tickets = await SupportTicket.find()
    .populate("user", "fullName email phone")
    .populate("claim", "claim_number claim_type amount")
    .populate("messages.sender", "fullName email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: tickets,
  });
});

/**
 * PATCH /api/admin/support/:id
 * Admin updates support ticket (e.g. status, priority)
 */
const updateAdminSupportTicket = catchAsync(async (req, res, next) => {
  const { status, priority, assignedAdmin } = req.body;

  const validStatuses = ["open", "in_progress", "resolved", "closed", "Open", "In Progress", "Resolved"];
  if (status && !validStatuses.includes(status)) {
    return next(new AppError("Invalid status", 400));
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (priority) updateData.priority = priority;
  if (assignedAdmin) updateData.assignedAdmin = assignedAdmin;

  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate("user", "fullName email phone")
    .populate("assignedAdmin", "fullName email");

  if (!ticket) {
    return next(new AppError("Support ticket not found.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Support ticket updated successfully.",
    data: ticket,
  });
});

/**
 * POST /api/support-tickets/:id/messages
 * Generic support ticket reply action for both users and admins
 */
const replyToSupportTicket = catchAsync(async (req, res, next) => {
  const { text } = req.body;

  if (!text || !String(text).trim()) {
    return next(new AppError("Message text is required.", 400));
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    return next(new AppError("Support ticket not found.", 404));
  }

  const isUser = req.user.role !== "admin" && req.user.role !== "Claims Officer" && req.user.role !== "Support Executive" && req.user.role !== "Insurance Manager";

  // If user, ensure they own the ticket
  if (isUser && ticket.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Unauthorized access to this ticket.", 403));
  }

  ticket.messages.push({
    sender: req.user._id,
    senderRole: isUser ? "user" : "admin",
    text: String(text).trim(),
    createdAt: new Date(),
  });

  // Reopen resolved/closed ticket on user reply
  if (isUser && (ticket.status === "resolved" || ticket.status === "closed" || ticket.status === "Resolved")) {
    ticket.status = "open";
  }

  await ticket.save();

  const updatedTicket = await SupportTicket.findById(ticket._id)
    .populate("user", "fullName email phone")
    .populate("assignedAdmin", "fullName email")
    .populate("messages.sender", "fullName email");

  res.status(200).json({
    success: true,
    message: "Reply sent successfully.",
    data: updatedTicket,
  });
});

module.exports = {
  createSupportTicket,
  getUserSupportTickets,
  getAdminSupportTickets,
  updateAdminSupportTicket,
  replyToSupportTicket,
};
